#!/bin/sh
set -e

/scripts/wait-for-it.sh express:8000 --timeout=60 --strict -- echo "✅ Express is up"
/scripts/wait-for-it.sh elasticsearch:9200 --timeout=60 --strict -- echo "✅ Elasticsearch is up"
/scripts/wait-for-it.sh kibana:5601 --timeout=60 --strict -- echo "✅ Kibana is up"

echo "⏳ Waiting for users.json..."
while [ ! -f /scripts/users.json ]; do
  sleep 1
done
echo "✅ users.json is ready."

exec k6 run k6-test.js