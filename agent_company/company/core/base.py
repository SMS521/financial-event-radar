"""Shared plumbing: paths, config, database, logging, HTTP."""
import json
import os
import sqlite3
import sys
import threading
import time
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONFIG = os.path.join(ROOT, "config")
DATA = os.path.join(ROOT, "data")
REPORTS = os.path.join(ROOT, "reports")
SECRETS = os.path.join(ROOT, "secrets")
VENDOR = os.path.join(ROOT, "vendor")
if os.path.isdir(VENDOR) and VENDOR not in sys.path:
    sys.path.insert(0, VENDOR)   # bundled Anthropic SDK for the portable Python


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def cfg(name, default=None):
    try:
        with open(os.path.join(CONFIG, name), encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def secrets():
    """secrets/keys.txt: KEY=value lines. Never committed, never logged."""
    out = {}
    p = os.path.join(SECRETS, "keys.txt")
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if v.strip():
                        out[k.strip()] = v.strip()
    for k in ("ANTHROPIC_API_KEY", "ETORO_API_KEY", "ETORO_USER_KEY"):
        if os.environ.get(k) and k not in out:
            out[k] = os.environ[k]
    return out


# ---------------------------------------------------------------- logging
_LOG_LOCK = threading.Lock()


def log(agent, msg):
    line = f"{datetime.now().strftime('%H:%M:%S')} [{agent}] {msg}"
    with _LOG_LOCK:
        print(line, flush=True)
        os.makedirs(REPORTS, exist_ok=True)
        with open(os.path.join(REPORTS, "company.log"), "a", encoding="utf-8") as f:
            f.write(datetime.now().strftime("%Y-%m-%d ") + line + "\n")


# ---------------------------------------------------------------- database
SCHEMA = """
CREATE TABLE IF NOT EXISTS series_meta(sid INTEGER PRIMARY KEY, symbol TEXT UNIQUE, source TEXT,
  freq TEXT DEFAULT 'D', note TEXT, updated TEXT);
-- compact store: integer series id, integer date (YYYYMMDD), prices as integers x 10^4
CREATE TABLE IF NOT EXISTS px(sid INTEGER, d INTEGER, c INTEGER, h INTEGER, l INTEGER, v INTEGER,
  PRIMARY KEY(sid, d)) WITHOUT ROWID;
CREATE VIEW IF NOT EXISTS prices AS SELECT m.symbol AS symbol,
  printf('%04d-%02d-%02d', p.d / 10000, p.d / 100 % 100, p.d % 100) AS date,
  p.c / 10000.0 AS close, p.h / 10000.0 AS high, p.l / 10000.0 AS low, p.v AS volume, m.source AS source
  FROM px p JOIN series_meta m USING(sid);
CREATE TABLE IF NOT EXISTS events(date TEXT, symbol TEXT, kind TEXT, text TEXT, source TEXT,
  url TEXT, created TEXT, PRIMARY KEY(date, symbol, kind, text));
CREATE TABLE IF NOT EXISTS news(symbol TEXT, ts TEXT, title TEXT, url TEXT, source TEXT,
  tone TEXT, fetched TEXT, PRIMARY KEY(symbol, title));
CREATE TABLE IF NOT EXISTS memos(id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT, ts TEXT,
  agent TEXT, topic TEXT, symbol TEXT, status TEXT, confidence REAL, body TEXT);
CREATE TABLE IF NOT EXISTS agent_runs(run_id TEXT, agent TEXT, started TEXT, finished TEXT,
  status TEXT, message TEXT, PRIMARY KEY(run_id, agent));
CREATE TABLE IF NOT EXISTS strategies(run_id TEXT, name TEXT, params TEXT, is_metrics TEXT,
  oos_metrics TEXT, verdict TEXT, reasons TEXT, equity TEXT, ts TEXT, PRIMARY KEY(run_id, name));
CREATE TABLE IF NOT EXISTS trades(id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT, broker TEXT,
  strategy TEXT, symbol TEXT, side TEXT, amount REAL, price REAL, position_id TEXT,
  status TEXT, raw TEXT);
CREATE TABLE IF NOT EXISTS paper_equity(date TEXT, strategy TEXT, value REAL,
  PRIMARY KEY(date, strategy));
"""


class DB:
    def __init__(self, path=None):
        os.makedirs(DATA, exist_ok=True)
        self.path = path or os.path.join(DATA, "market.db")
        starter = os.path.join(DATA, "starter.db")
        if path is None and not os.path.exists(self.path) and os.path.exists(starter):
            import shutil
            shutil.copy(starter, self.path)   # ship-with data: FX since 1971, VIX, oil, macro
        self._local = threading.local()
        self.x(SCHEMA, script=True)

    @property
    def con(self):
        c = getattr(self._local, "con", None)
        if c is None:
            c = sqlite3.connect(self.path, timeout=60)
            c.row_factory = sqlite3.Row
            self._local.con = c
        return c

    def x(self, sql, args=(), script=False, many=False):
        c = self.con
        if script:
            c.executescript(sql)
        elif many:
            c.executemany(sql, args)
        else:
            cur = c.execute(sql, args)
            c.commit()
            return cur
        c.commit()

    def q(self, sql, args=()):
        return [dict(r) for r in self.con.execute(sql, args).fetchall()]

    # ---- compact price store
    SCALE = 10000

    def sid(self, symbol, source=None, freq="D", note=None, create=True):
        r = self.con.execute("SELECT sid FROM series_meta WHERE symbol=?", (symbol,)).fetchone()
        if r:
            if source:
                self.x("UPDATE series_meta SET source=?, updated=? WHERE sid=?", (source, now_iso(), r[0]))
            return r[0]
        if not create:
            return None
        return self.x("INSERT INTO series_meta(symbol,source,freq,note,updated) VALUES(?,?,?,?,?)",
                      (symbol, source, freq, note, now_iso())).lastrowid

    def put_prices(self, symbol, rows, source, freq="D", note=None):
        """rows: (date 'YYYY-MM-DD', close, high, low, volume). Returns rows written."""
        sid = self.sid(symbol, source, freq, note)
        S = self.SCALE

        def i(v):
            return None if v is None else int(round(float(v) * S))
        out = []
        for d, c, h, l, v in rows:
            if c is None:
                continue
            ci = i(c)
            hi, lo = i(h), i(l)
            out.append((sid, int(d[:10].replace("-", "")), ci, None if hi == ci else hi, None if lo == ci else lo,
                        int(v) if v else None))
        self.x("INSERT OR REPLACE INTO px VALUES(?,?,?,?,?,?)", out, many=True)
        return len(out)

    def last_date(self, symbol):
        sid = self.sid(symbol, create=False)
        if sid is None:
            return None
        r = self.con.execute("SELECT MAX(d) FROM px WHERE sid=?", (sid,)).fetchone()[0]
        return f"{r // 10000:04d}-{r // 100 % 100:02d}-{r % 100:02d}" if r else None

    def series(self, symbol, start=None):
        sid = self.sid(symbol, create=False)
        if sid is None:
            return []
        a = [sid]
        sql = "SELECT d, c FROM px WHERE sid=?"
        if start:
            sql += " AND d>=?"
            a.append(int(start.replace("-", "")))
        S = float(self.SCALE)
        return [(f"{d // 10000:04d}-{d // 100 % 100:02d}-{d % 100:02d}", c / S)
                for d, c in self.con.execute(sql + " ORDER BY d", a).fetchall()]

    def memo(self, run_id, agent, topic, body, symbol=None, status=None, confidence=None):
        self.x("INSERT INTO memos(run_id,ts,agent,topic,symbol,status,confidence,body) VALUES(?,?,?,?,?,?,?,?)",
               (run_id, now_iso(), agent, topic, symbol, status, confidence, json.dumps(body, default=str)))

    def memos(self, run_id, agent=None, topic=None):
        sql, a = "SELECT * FROM memos WHERE run_id=?", [run_id]
        if agent:
            sql += " AND agent=?"
            a.append(agent)
        if topic:
            sql += " AND topic=?"
            a.append(topic)
        out = self.q(sql + " ORDER BY id", a)
        for m in out:
            m["body"] = json.loads(m["body"])
        return out


# ---------------------------------------------------------------- HTTP
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
SOURCE_STATS = {}
BLOCKED = set()


def _stat(name, ok, err=""):
    s = SOURCE_STATS.setdefault(name, {"ok": 0, "fail": 0, "last_error": ""})
    s["ok" if ok else "fail"] += 1
    if not ok:
        s["last_error"] = str(err)[:200]


def http(url, source, method="GET", headers=None, body=None, timeout=20, raw=False):
    host = urllib.parse.urlparse(url).hostname
    if host in BLOCKED:
        _stat(source, False, "host blocked earlier this run")
        raise HostBlocked(f"{host} blocked")
    h = {"User-Agent": UA, "Accept": "*/*"}
    h.update(headers or {})
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            payload = r.read()
        _stat(source, True)
        return payload if raw else payload.decode("utf-8", "replace")
    except Exception as e:
        _stat(source, False, e)
        if "Tunnel connection failed" in str(e) or "getaddrinfo" in str(e) or "timed out" in str(e):
            BLOCKED.add(host)
            raise HostBlocked(f"{host} unreachable: {e}") from e
        raise


def http_json(url, source, **kw):
    return json.loads(http(url, source, **kw))


def new_run_id(prefix):
    return f"{prefix}-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:4]}"


class HostBlocked(OSError):
    pass


def retry(fn, tries=3, wait=2.0):
    """Retry transient errors (429/5xx/timeouts). A blocked host is not retried."""
    for i in range(tries):
        try:
            return fn()
        except HostBlocked:
            raise
        except Exception as e:
            code = getattr(e, "code", None)
            if i == tries - 1 or code in (400, 401, 403, 404):
                raise
            time.sleep(wait * (2 ** i))
