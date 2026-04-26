# React 19 Tail Resume Checklist

Use this when stopping work on the React 19 frontend test migration and resuming later after a restart.

## Current Context

- Working branch: `slice-22-react19-tail-followup`
- Open PR: `#2612`
- PR URL: `https://github.com/reef-pi/reef-pi/pull/2612`
- Base branch to refresh from: `main`

This branch already contains:
- merged follow-up work rebased onto recent `main`
- additional local-only React 19 test-tail fixes not yet committed

At the time this checklist was written, the last in-progress file was:
- `front-end/src/lighting/solar_profile.test.js`

## Stop Safely Before Restart

From the repo root:

```bash
cd /home/ranjib/workspace/reef-pi-codex
git status --short
git stash push -u -m "react19-tail-followup-wip-before-restart"
git stash list --max-count=3
```

Notes:
- `-u` includes untracked files such as `.ai/`, `.aider.chat.history.md`, and `.aider.input.history`
- if you prefer to keep those helper files out of the stash, omit `-u`

## Resume After Restart

From the repo root:

```bash
cd /home/ranjib/workspace/reef-pi-codex
git checkout main
git pull --ff-only
git checkout slice-22-react19-tail-followup
git rebase main
git stash apply stash@{0}
git status --short
```

If the latest stash is not the resume stash, check:

```bash
git stash list --max-count=5
```

and replace `stash@{0}` with the correct entry.

## Quick Context Capture

If you want a minimal local audit trail before stopping:

```bash
git branch --show-current
git log --oneline -5
git stash list --max-count=5
```

## What To Continue Next

After restoring the stash:

1. Re-run the targeted file that was last in progress:

```bash
rtk yarn jest front-end/src/lighting/solar_profile.test.js --runInBand
```

2. Continue reducing the remaining React 19 Jest tail on this branch.

3. When a small batch is green, create another incremental commit and update PR `#2612`.

## Current Strategy

- Prefer small, targeted React 19-safe test rewrites over broad runtime changes.
- Favor direct class/function invocation and element-tree assertions over Enzyme `shallow`/`mount`.
- Add tiny raw-export/helper seams only when necessary for connected components or Formik wrappers.
- Re-run targeted Jest files first; use full `rtk yarn jest --runInBand` only as a checkpoint.
