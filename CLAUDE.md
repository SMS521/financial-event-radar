# Working on financial-event-radar

This repo was imported from a Gemini-built prototype and has not been
independently trusted yet — see `AUDIT.md` before assuming any "PASS",
"verified", or "leakage-free" indicator in the code means what it claims.

## Standing rule: announce, explain, wait — every time

**This rule binds the interactive orchestrating session — a human directly
chatting with Claude — before it starts or approves an `agentos run`
against this repo. It does not bind the individual agent sessions that run
*inside* an already-approved run** (`product-agent`, `developer-agent`,
`qa-agent`, `release-agent`, etc.). Those are single, non-interactive SDK
sessions with no chat channel back to a human mid-task — if one tries to
pause and "wait for an explicit yes" the way this section describes, it
cannot receive an answer and will fail its task by doing nothing. That
happened for real on 2026-08-21: `product-agent` read this file, applied
the rule to itself, and spent all three of its attempts asking permission
instead of doing its (read-only, harmless) job, until `qa`/`reviewer`
correctly failed and escalated it. An agent-os agent session should do its
task per its own skill instructions and whatever the Permission Engine /
`policy.yaml` autonomy tier / approval queue already gates live — that
machinery, not a chat pause, is how an in-flight agent's risky actions get
controlled.

Before a human-facing session starts or approves an `agentos run` here, in
this order:

1. **State the plan** — what's about to happen, concretely.
2. **State why** — what it's for and what the expected result is.
3. **Wait for an explicit yes** before executing.

Per action, not per conversation — an approval for one step does not carry
forward to the next one. Set explicitly by the user on 2026-08-20; see the
same rule in `agent-os/CLAUDE.md`, which is the system actually running
these agents against this repo.

## Context for whoever picks this up

- `AUDIT.md` is the source of truth for what's real vs. decorative in this
  codebase as of the import commit. Its "fix list" is what `agentos plan`
  was run against.
- Nothing in this repo has been modified to close any audit gap yet as of
  the initial import — check `git log` before assuming otherwise.
