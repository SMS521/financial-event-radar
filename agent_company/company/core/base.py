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
CREATE TABLE IF NOT EXISTS prices(symbol TEXT, date TEXT, close REAL, high REAL, low REAL,
  volume REAL, source TEXT, PRIMARY KEY(symbol, date));
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

    # convenience
    def series(self, symbol, start=None):
        rows = self.q("SELECT date, close FROM prices WHERE symbol=? AND close IS NOT NULL"
                      + (" AND date>=?" if start else "") + " ORDER BY date",
                      (symbol, start) if start else (symbol,))
        return [(r["date"], r["close"]) for r in rows]

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
        raise OSError(f"{host} blocked")
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
        if "Tunnel connection failed" in str(e) or "getaddrinfo" in str(e):
            BLOCKED.add(host)
        raise


def http_json(url, source, **kw):
    return json.loads(http(url, source, **kw))


def new_run_id(prefix):
    return f"{prefix}-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:4]}"


def retry(fn, tries=3, wait=2.0):
    for i in range(tries):
        try:
            return fn()
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(wait * (2 ** i))
