# scripts/validate_react19_task.sh
#!/usr/bin/env bash
set -euo pipefail

TASK_ID="${1:?usage: validate_react19_task.sh <TASK_ID>}"
TIMEOUT_SEC="${TIMEOUT_SEC:-180}"
LOG_DIR=".ai/react19/${TASK_ID}"
mkdir -p "$LOG_DIR"

case "$TASK_ID" in
  T5)  CMD='rtk yarn jest front-end/src/macro/main.test.js --runInBand' ;;
  T6)  CMD='rtk yarn jest front-end/src/ui_components/collapsible.test.js --runInBand' ;;
  T7)  CMD='rtk yarn jest front-end/src/telemetry/telmetry.test.js --runInBand' ;;
  T8)  CMD='rtk yarn jest front-end/src/journal/entry_form.test.js --runInBand' ;;
  T9)  CMD='rtk yarn jest front-end/src/ph/calibration.test.js --runInBand' ;;
  T10) CMD='rtk yarn jest front-end/src/ph/edit_ph.test.js --runInBand' ;;
  T11) CMD='rtk yarn jest front-end/src/ph/control_chart.test.js --runInBand' ;;
  T12) CMD='rtk yarn jest front-end/src/macro/edit_macro.test.js --runInBand' ;;
  T13) CMD='rtk yarn jest front-end/src/macro/steps.test.js --runInBand' ;;
  T14) CMD='rtk yarn jest front-end/src/select_equipment.test.jsx --runInBand' ;;
  T15) CMD='rtk yarn jest front-end/src/ui_components/color_picker.test.js --runInBand' ;;
  T16) CMD='rtk yarn jest front-end/src/ui_components/cron.test.js --runInBand' ;;
  T17) CMD='rtk yarn jest front-end/src/journal/new.test.js --runInBand' ;;
  T18) CMD='rtk yarn jest front-end/src/journal/edit_journal.test.js --runInBand' ;;
  T19) CMD='rtk yarn jest front-end/src/journal/form.test.js --runInBand' ;;
  T20) CMD='rtk yarn jest front-end/src/journal/edit_entry.test.js --runInBand' ;;
  T21) CMD='rtk yarn jest front-end/src/temperature/calibration.test.js --runInBand' ;;
  T22) CMD='rtk yarn jest front-end/src/drivers/new.test.js --runInBand' ;;
  T23) CMD='rtk yarn jest front-end/src/drivers/driver.test.js --runInBand' ;;
  T24) CMD='rtk yarn jest front-end/src/doser/calibration.test.js --runInBand' ;;
  T25) CMD='rtk yarn jest front-end/src/doser/edit_doser.test.js --runInBand' ;;
  T26) CMD='rtk yarn jest front-end/src/doser/doser.test.js --runInBand' ;;
  T27) CMD='rtk yarn jest front-end/src/timers/edit_timer.test.js --runInBand' ;;
  T28) CMD='rtk yarn jest front-end/src/timers/timers.test.js --runInBand' ;;
  T29) CMD='rtk yarn jest front-end/src/ato/edit_ato.test.js --runInBand' ;;
  T30) CMD='rtk yarn jest front-end/src/instances/instances.test.js --runInBand' ;;
  T31) CMD='rtk yarn jest front-end/src/health_chart.test.js --runInBand' ;;
  T32) CMD='rtk yarn jest front-end/src/lighting/auto_profile.test.js --runInBand' ;;
  *)
    echo "Unknown task id: $TASK_ID" >&2
    exit 2
    ;;
esac

set +e
timeout "${TIMEOUT_SEC}s" bash -lc "$CMD" >"$LOG_DIR/validate.log" 2>&1
STATUS=$?
set -e

{
  echo "TASK_ID=$TASK_ID"
  echo "CMD=$CMD"
  echo "STATUS=$STATUS"
  if [ "$STATUS" -eq 124 ]; then
    echo "RESULT=TIMEOUT"
  elif [ "$STATUS" -eq 0 ]; then
    echo "RESULT=PASS"
  else
    echo "RESULT=FAIL"
  fi
} >"$LOG_DIR/validate.meta"

tail -n 120 "$LOG_DIR/validate.log" >"$LOG_DIR/validate.tail.log" || true

exit "$STATUS"
