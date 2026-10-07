"""The 20-person company and the CEO who runs it."""
from concurrent.futures import ThreadPoolExecutor

from company.agents.base import Agent
from company.agents.data_dept import DataAuditor, EventClerk, FXEngineer, PriceEngineer
from company.agents.quant_lab import Backtester, DevilsAdvocate, PatternResearcher
from company.agents.reporter import Reporter
from company.agents.research import FactChecker, MacroEconomist, PredictionMarkets, SectorAnalyst, SocialSentiment
from company.agents.risk_exec import ChiefRiskOfficer, PaperTrader
from company.core.base import log


class CEO(Agent):
    id, name, title, dept = 1, "ceo", "CEO / Orchestrator", "Leadership"
    job = "Runs the timetable, enforces gates (no research on bad data, no trades without approval), logs everything."

    def __init__(self):
        self.plan = []

    def run(self, ctx):
        return "ok", f"pipeline '{ctx.mode}': " + " → ".join(self.plan)


ceo = CEO()
cro = ChiefRiskOfficer()
price, fx, events, auditor = PriceEngineer(), FXEngineer(), EventClerk(), DataAuditor()
analysts = [SectorAnalyst("energy", 7), SectorAnalyst("semis", 8), SectorAnalyst("us", 9),
            SectorAnalyst("asia", 10), SectorAnalyst("commod", 11)]
social, poly, macro = SocialSentiment(), PredictionMarkets(), MacroEconomist()
pattern, backtester, devil = PatternResearcher(), Backtester(), DevilsAdvocate()
checker, trader, reporter = FactChecker(), PaperTrader(), Reporter()

STAFF = sorted([ceo, cro, price, fx, events, auditor, *analysts, social, poly, macro,
                pattern, backtester, devil, checker, trader, reporter], key=lambda a: a.id)
assert len(STAFF) == 20, len(STAFF)


def _parallel(ctx, agents):
    with ThreadPoolExecutor(len(agents)) as ex:
        return list(ex.map(lambda a: a.execute(ctx), agents))


def collect(ctx):
    _parallel(ctx, [price, fx])
    events.execute(ctx)
    ok = auditor.execute(ctx)[0] != "fail"
    from datetime import date
    if date.today().day == 1 and not ctx.demo:      # monthly housekeeping: reclaim space
        ctx.db.con.execute("VACUUM")
    return ok


def research(ctx):
    _parallel(ctx, [social, poly])
    _parallel(ctx, analysts + [macro])
    checker.execute(ctx)


def quant(ctx):
    pattern.execute(ctx)
    if backtester.execute(ctx)[0] != "fail":
        devil.execute(ctx)


PIPELINES = {
    "collect": ["collect", "report"],
    "backtest": ["quant", "risk", "report"],
    "research": ["research", "risk", "report"],
    "night": ["collect", "research", "quant", "risk", "report"],
    "day": ["collect", "risk", "trade", "report"],
    "demo": ["collect", "research", "quant", "risk", "trade", "report"],
}


def run_pipeline(ctx):
    steps = PIPELINES[ctx.mode]
    ceo.plan = steps
    ceo.execute(ctx)
    log("ceo", f"run {ctx.run_id} | AI {'ON' if ctx.ai.on else 'OFF (rules)'} | demo={ctx.demo}")
    gate_open = True
    for step in steps:
        if step == "collect":
            gate_open = collect(ctx)
            if not gate_open:
                log("ceo", "Data gate CLOSED by Data Auditor — skipping research/quant/trading, reporting only")
        elif step == "research" and gate_open:
            research(ctx)
        elif step == "quant" and gate_open:
            quant(ctx)
        elif step == "risk":
            cro.execute(ctx)
        elif step == "trade" and gate_open:
            trader.execute(ctx)
        elif step == "report":
            reporter.execute(ctx)
    return ctx.shared.get("dashboard_path")
