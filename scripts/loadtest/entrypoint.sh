#!/bin/sh
set -e

url_hostport() {
  local url="$1"
  url="${url#*://}"
  echo "${url%%/*}"
}

EXPRESS_ADDR=$(url_hostport "${EXPRESS_HEALTH_URL:-http://express:8000}")
ELASTIC_ADDR=$(url_hostport "${ELASTICSEARCH_HEALTH_URL:-http://elasticsearch:9200}")
KIBANA_ADDR=$(url_hostport "${KIBANA_HEALTH_URL:-http://kibana:5601}")

/wait-for-it.sh "$EXPRESS_ADDR" --timeout=60 --strict -- echo "✅ Express is up"
/wait-for-it.sh "$ELASTIC_ADDR" --timeout=60 --strict -- echo "✅ Elasticsearch is up"
/wait-for-it.sh "$KIBANA_ADDR" --timeout=60 --strict -- echo "✅ Kibana is up"

echo "⏳ Waiting for users.json..."
while [ ! -f /scripts/users.json ]; do
  sleep 1
done
echo "✅ users.json is ready."

exec k6 run k6-test.js
