"""Paper brokers. The local ledger always runs (so results are always measurable);
the eToro DEMO broker mirrors orders onto your eToro virtual account when keys exist.
There is intentionally no real-money broker in this codebase."""
import json

from company.core.base import now_iso
from company.data.providers import EToro

SCHEMA = """
CREATE TABLE IF NOT EXISTS paper_positions(strategy TEXT, symbol TEXT, units REAL, entry_price REAL,
  entry_date TEXT, etoro_position_id TEXT, PRIMARY KEY(strategy, symbol));
CREATE TABLE IF NOT EXISTS paper_cash(strategy TEXT PRIMARY KEY, cash REAL);
CREATE TABLE IF NOT EXISTS etoro_map(symbol TEXT PRIMARY KEY, instrument_id INTEGER);
"""


class LocalLedger:
    name = "local"

    def __init__(self, db, capital):
        self.db = db
        db.x(SCHEMA, script=True)
        self.capital = capital

    def cash(self, strat):
        r = self.db.q("SELECT cash FROM paper_cash WHERE strategy=?", (strat,))
        if not r:
            self.db.x("INSERT INTO paper_cash VALUES(?,?)", (strat, self.capital))
            return self.capital
        return r[0]["cash"]

    def positions(self, strat):
        return {r["symbol"]: r for r in self.db.q("SELECT * FROM paper_positions WHERE strategy=?", (strat,))}

    def buy(self, strat, sym, amount, price, day, etoro_id=None):
        units = amount / price
        self.db.x("INSERT OR REPLACE INTO paper_positions VALUES(?,?,?,?,?,?)", (strat, sym, units, price, day, etoro_id))
        self.db.x("UPDATE paper_cash SET cash=cash-? WHERE strategy=?", (amount, strat))

    def sell(self, strat, sym, price):
        p = self.positions(strat).get(sym)
        if not p:
            return 0.0
        proceeds = p["units"] * price
        self.db.x("DELETE FROM paper_positions WHERE strategy=? AND symbol=?", (strat, sym))
        self.db.x("UPDATE paper_cash SET cash=cash+? WHERE strategy=?", (proceeds, strat))
        return proceeds - p["units"] * p["entry_price"]

    def value(self, strat, prices):
        v = self.cash(strat)
        for s, p in self.positions(strat).items():
            v += p["units"] * (prices.get(s) or p["entry_price"])
        return v


class EToroDemo:
    """Mirrors orders to eToro's DEMO environment. Field names follow eToro's
    v1 by-amount route (InstrumentID / IsBuy / Leverage / Amount)."""
    name = "etoro-demo"

    def __init__(self, db, keys, conf):
        self.db, self.api, self.conf = db, EToro(keys, conf), conf
        db.x(SCHEMA, script=True)

    @property
    def ready(self):
        return self.api.ready

    def instrument(self, sym, etoro_symbol):
        r = self.db.q("SELECT instrument_id FROM etoro_map WHERE symbol=?", (sym,))
        if r:
            return r[0]["instrument_id"]
        iid = self.api.instrument_id(etoro_symbol or sym)
        if iid:
            self.db.x("INSERT OR REPLACE INTO etoro_map VALUES(?,?)", (sym, iid))
        return iid

    def open(self, sym, etoro_symbol, amount):
        iid = self.instrument(sym, etoro_symbol)
        if not iid:
            return None, f"no eToro instrument for {etoro_symbol or sym}"
        res = self.api.post(self.conf["paths"]["demo_open_by_amount"],
                            {"InstrumentID": iid, "IsBuy": True, "Leverage": 1, "Amount": round(amount, 2)})
        pos = (res.get("orderForOpen") or res.get("position") or res).get("positionID") if isinstance(res, dict) else None
        return pos, json.dumps(res)[:400]

    def close(self, sym, position_id):
        if not position_id:
            # find it in the demo portfolio by instrument
            iid = self.instrument(sym, None)
            pf = self.api.get(self.conf["paths"]["demo_portfolio"])
            for p in (pf.get("clientPortfolio") or pf).get("positions", []) if isinstance(pf, dict) else []:
                if p.get("instrumentID") == iid or p.get("InstrumentID") == iid:
                    position_id = p.get("positionID") or p.get("PositionID")
                    break
        if not position_id:
            return f"no open eToro demo position found for {sym}"
        iid = self.instrument(sym, None)
        res = self.api.post(self.conf["paths"]["demo_close"].format(position_id=position_id),
                            {"InstrumentId": iid, "UnitsToDeduct": None})
        return json.dumps(res)[:400]
