#!/usr/bin/env bash
set -e

chmod +x /wait-for-it.sh

# Wait for dependencies
/wait-for-it.sh express:8000 --timeout=120 --strict
echo "Waiting for Postgres..."
/wait-for-it.sh postgres:5432 --timeout=120 --strict
echo "Waiting for Redis..."
/wait-for-it.sh redis:6379 --timeout=120 --strict

npm run start:worker &
APP_PID=$!

cleanup() {
  echo "⏳ Signal received — shutting down worker (pid $APP_PID)…"
  kill -TERM "$APP_PID" 2>/dev/null
  wait "$APP_PID"
  echo "✔️ Worker exited cleanly"
  exit 0
}

trap cleanup SIGTERM SIGINT

wait "$APP_PID"
