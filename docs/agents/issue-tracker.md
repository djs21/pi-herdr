# Issue Tracker: Beads (Local)

Issues are tracked locally using **beads (bd)** — a lightweight, Dolt-powered issue tracker.

## Workflow

- Issues live in `.beads/dolt/` database
- `bd create` — create a new issue
- `bd list` — list all issues
- `bd show <id>` — view issue details
- `bd close <id>` — close an issue
- `bd gate` — manage async coordination gates
- `bd label` — manage issue labels
- `bd dolt push` — sync beads data to remote (if configured)

## Reference

See `bd --help` for full command list.