# scripts/run_react19_aider_task.sh
#!/usr/bin/env bash
set -euo pipefail

TASK_ID="${1:?usage: run_react19_aider_task.sh <TASK_ID> <PROMPT_FILE> <FILES...>}"
PROMPT_FILE="${2:?usage: run_react19_aider_task.sh <TASK_ID> <PROMPT_FILE> <FILES...>}"
shift 2
FILES=("$@")
export OLLAMA_API_BASE=http://127.0.0.1:11434

MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
MODEL="${MODEL:-ollama/qwen2.5-coder:14b}"
ROOT="$(git rev-parse --show-toplevel)"
LOG_DIR="$ROOT/.ai/react19/$TASK_ID"
mkdir -p "$LOG_DIR"

cd "$ROOT"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree is not clean. Commit or stash before starting $TASK_ID." >&2
  exit 2
fi

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  RUN_PROMPT="$LOG_DIR/prompt.attempt.${attempt}.txt"

  {
    cat "$PROMPT_FILE"
    echo
    echo "Bounded loop rules:"
    echo "- Task ID: $TASK_ID"
    echo "- This is attempt $attempt of $MAX_ATTEMPTS."
    echo "- Only edit the task files already added to the chat."
    echo "- Do not commit."
    echo "- Do not widen scope."
    echo "- Run the configured test command and fix only what it reports."
    echo "- Stop after the smallest change set that makes the task validator pass."
    if [ -f "$LOG_DIR/validate.tail.log" ]; then
      echo
      echo "Previous validator tail:"
      echo '```text'
      cat "$LOG_DIR/validate.tail.log"
      echo '```'
    fi
  } >"$RUN_PROMPT"

  AIDER_ARGS=(
    --model "$MODEL"
    --timeout 3000
    --yes-always
    --read docs/library-migration-plan.md
    --read docs/react19-migration-status.md
    --read docs/react19-local-llm-tasks.md
    --test-cmd "./scripts/validate_react19_task.sh $TASK_ID"
    --auto-test
    --message-file "$RUN_PROMPT"
  )

  for f in "${FILES[@]}"; do
    AIDER_ARGS+=(--file "$f")
  done

  aider "${AIDER_ARGS[@]}" | tee "$LOG_DIR/aider.attempt.${attempt}.log" || true

  if ./scripts/validate_react19_task.sh "$TASK_ID"; then
    echo "Task $TASK_ID passed on attempt $attempt."
    git status --short
    exit 0
  fi

  echo "Task $TASK_ID still failing after attempt $attempt."
done

echo "Task $TASK_ID exhausted $MAX_ATTEMPTS attempts."
exit 1
