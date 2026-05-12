# Per-issue execution prompts

Each prompt is a self-contained system message a Claude Code session can run with. They follow the same shape:

1. Restate the goal in one line.
2. Point at the canonical issue file.
3. List exact files to touch.
4. Spell out acceptance gates.
5. End with the commit message format.

## How to use

```bash
# Pick an issue, e.g. #1
claude code --system "$(cat github_issues/prompts/01.md)" \
            --task "Implement the tokens listed in the issue file"
```

Or paste the prompt into Claude Code's chat as the first message.
