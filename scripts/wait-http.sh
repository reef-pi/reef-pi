#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <url> <timeout-seconds>" >&2
  exit 2
fi

url="$1"
timeout="$2"

for _ in $(seq 1 "$timeout"); do
  status="$(curl -fsS -o /dev/null -w '%{http_code}' "$url" || true)"
  case "$status" in
    200|204|301|302|401|403)
      exit 0
      ;;
  esac
  sleep 1
done

echo "timed out waiting for $url after ${timeout}s" >&2
exit 1
