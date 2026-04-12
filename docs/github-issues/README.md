# GitHub Issue Drafts

This directory contains ready-to-paste issue bodies for the refactor program described in [../refactor-plan.md](../refactor-plan.md).

Suggested creation order:

1. create the meta issue
2. create slice issues in sequence
3. link each PR to its slice issue
4. open CI regression issues only when a failure is not local to the current PR

Recommended labels:

- `refactor`
- `refactor:backend`
- `refactor:frontend`
- `refactor:ci`
- `risk:low`
- `risk:medium`
- `risk:high`

Suggested issue linking:

- each slice issue should reference the meta issue
- each PR should use `Closes #<slice-issue>`
- follow-up issues should reference both the slice issue and the failed PR
