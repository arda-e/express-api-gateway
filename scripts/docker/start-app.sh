#!/usr/bin/env bash
set -e

# Wait for dependencies
./scripts/wait-for-it.sh postgres:5432 -- echo "Postgres is up"
./scripts/wait-for-it.sh redis:6379 -- echo "Redis is up"

if [ "$NODE_ENV" = "production" ]; then
  node dist/index.js &
else
  tsx -r tsconfig-paths/register --watch --inspect=0.0.0.0:9229 src/index.ts &
fi
APP_PID=$!

cleanup() {
  echo "⏳ Signal received — shutting down app (pid $APP_PID)…"
  kill -TERM "$APP_PID" 2>/dev/null
  wait "$APP_PID"
  echo "✔️ App exited cleanly"
  exit 0
}

trap cleanup SIGTERM SIGINT

wait "$APP_PID"
