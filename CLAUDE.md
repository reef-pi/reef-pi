# reef-pi · Claude Code rules

Read these in order before doing anything:
1. front-end/design-system/SKILL.md  — design constraints
2. front-end/design-system/github_issues/CLAUDE.md  — operating manual
3. front-end/design-system/github_issues/STRATEGY.md  — sequencing
4. front-end/design-system/github_issues/BACKLOG.md  — what to pick next

Hard rules:
- Tokens live in front-end/assets/sass/_tokens.scss and mirror
  front-end/design-system/colors_and_type.css.
- No raw hex literals in new code. Use var(--reefpi-*).
- One PR per issue. Commit prefix: [claude design]
- Ship behind a flag when the issue says so.
- Before any implementation work: create a feature branch.
  Never commit implementation code directly to main.
  Use: git checkout -b <feature-name> before first commit.
