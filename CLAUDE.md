# Working on financial-event-radar

This repo was imported from a Gemini-built prototype and has not been
independently trusted yet — see `AUDIT.md` before assuming any "PASS",
"verified", or "leakage-free" indicator in the code means what it claims.

## Standing rule: announce, explain, wait — every time

Before any agent-os agent (`developer-agent`, `qa-agent`, `release-agent`,
etc.) writes to a file in this repo, runs a shell command, commits, pushes,
or promotes anything here, a Claude session must, in the chat, in this
order:

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
