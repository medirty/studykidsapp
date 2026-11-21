---
description: Debug a StudyKids bug; auto-escalate to Opus after 2 failed attempts
model: sonnet
argument-hint: <bug description>
---

Bug: $ARGUMENTS

1. Use the systematic-debugging approach: reproduce with a failing test first, find the root cause, then fix.
2. Run the tests and show the output.
3. If the fix fails twice, stop and delegate the bug (with everything learned so far) to the `architect` subagent.
4. Log the fix in docs/CHANGELOG.md and commit. Report briefly in Indonesian.
