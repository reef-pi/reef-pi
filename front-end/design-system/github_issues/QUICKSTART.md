# [claude design] artifacts — quickstart

You now have two ways to drive the 26 fixes through Claude Code, plus a script that creates real GitHub issues with `[claude design]` in every title.

## Path A — Claude Code only (no GitHub)
Everything an agent needs is in `github_issues/`:
- `CLAUDE.md` — operating manual: definition of done, file conventions, sequencing rules.
- `STRATEGY.md` — five epics, parent→child map, rollout flags.
- `BACKLOG.md` — checklist; tick rows as PRs merge.
- `issue-NN-*.md` — full spec for each fix (API, visual, acceptance).
- `prompts/NN.md` — one-shot system prompt per issue, ready to paste into Claude Code.

Recommended loop:
```bash
# 1. Pick the next unchecked row in BACKLOG.md (top → bottom).
# 2. Start a Claude Code session with the matching prompt:
claude code --system "$(cat github_issues/prompts/01.md)" \
            --task "Implement issue #1 per its acceptance checklist."
# 3. Review the PR, merge, tick the box in BACKLOG.md.
```

## Path B — Real GitHub issues with `[claude design]` titles

```bash
cd github_issues
# 1. Create labels once
bash _labels.md          # or copy the gh label create block out
# 2. Create all 31 issues (5 epics + 26 children) with [claude design] prefix
REPO=owner/name bash import-as-claude-design.sh
```

Result:
- `[claude design][EPIC] Design tokens v2 — states, themes, contrast`
- `[claude design] Extend --reefpi-* scale with state tokens`
- ...

Filter them in the issues list with: `is:open [claude design] in:title`.

## Path C — Both (recommended)
Run path B to get the GitHub issues, then for each one paste the corresponding `prompts/NN.md` into a Claude Code session as the system message. The prompt already references the issue file by path, so the agent has the full spec without you re-pasting.
