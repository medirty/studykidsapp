---
description: Do the next StudyKids task from docs/PROGRESS.md with automatic model routing
model: sonnet
---

1. Read CLAUDE.md and docs/PROGRESS.md. Find the active phase and the first unchecked task.
2. If no tasks exist for the active phase, tell Bimo to run /plan-phase and stop.
3. If the task is tagged [opus] OR touches DB schema, API, auth, payments, or the question engine/mastery → delegate the whole task to the `architect` subagent.
   If tagged [sonnet] → do it yourself (you may use `implementer` / `tester` subagents).
3b. If the task is blocked by a manual action of Bimo (a `B*` item), do NOT just stop. Bimo is non-technical (PRD §16.5, CR-002): explain simply, check the real machine state first (e.g. `winget list`), try to do it yourself with Bimo's permission, and if the permission system denies it, do NOT work around it — give numbered click-by-click steps (one command per step, with the expected screen), then verify the result yourself and tick the `B*` item.
4. Verify: run tests, lint, typecheck and show the real output (verification-before-completion).
5. Tick the task in docs/PROGRESS.md, note evidence, commit with a conventional commit message.
6. Report in Indonesian, briefly: what was done, test evidence, next task. Suggest /clear.
Never start the next phase without Bimo's written approval.
