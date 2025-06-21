#!/usr/bin/env bash
set -e

chmod +x /wait-for-it.sh

echo "Waiting for Elasticsearch..."
/wait-for-it.sh elasticsearch:9200 --timeout=600 --strict

/bin/tini -- /usr/share/kibana/bin/kibana &
APP_PID=$!

cleanup() {
  echo "⏳ Signal received — shutting down Kibana (pid $APP_PID)…"
  kill -TERM "$APP_PID" 2>/dev/null
  wait "$APP_PID"
  echo "✔️ Kibana exited cleanly"
  exit 0
}

trap cleanup SIGTERM SIGINT

wait "$APP_PID"
