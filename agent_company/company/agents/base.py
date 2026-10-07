import traceback
from dataclasses import dataclass, field

from company.core.base import DB, cfg, log, now_iso


@dataclass
class Context:
    run_id: str
    mode: str                 # night | day | backtest | collect | demo
    demo: bool                # synthetic offline data
    db: DB
    ai: object
    settings: dict = field(default_factory=lambda: cfg("settings.json", {}))
    universe: dict = field(default_factory=lambda: cfg("universe.json", {}))
    portfolio: dict = field(default_factory=lambda: cfg("portfolio.json", {}))
    risk: dict = field(default_factory=lambda: cfg("risk.json", {}))
    synth: object = None
    shared: dict = field(default_factory=dict)   # in-memory hand-offs within one run


class Agent:
    id = 0
    name = "agent"
    title = ""
    dept = ""
    uses_ai = False
    job = ""

    def run(self, ctx):          # -> (status, message); status: ok | warn | fail | skip
        raise NotImplementedError

    def execute(self, ctx):
        started = now_iso()
        try:
            status, msg = self.run(ctx)
        except Exception as e:
            status, msg = "fail", f"{type(e).__name__}: {e}"
            log(self.name, traceback.format_exc(limit=3))
        ctx.db.x("INSERT OR REPLACE INTO agent_runs VALUES(?,?,?,?,?,?)",
                 (ctx.run_id, self.name, started, now_iso(), status, str(msg)[:500]))
        log(self.name, f"{status.upper()}: {msg}")
        return status, msg
