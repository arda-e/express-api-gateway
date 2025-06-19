#!/bin/sh
set -e

cd /scripts

url_hostport() {
  local url="$1"
  url="${url#*://}"
  echo "${url%%/*}"
}

EXPRESS_ADDR=$(url_hostport "${EXPRESS_HEALTH_URL:-http://express:8000}")
ELASTIC_ADDR=$(url_hostport "${ELASTICSEARCH_HEALTH_URL:-http://elasticsearch:9200}")
KIBANA_ADDR=$(url_hostport "${KIBANA_HEALTH_URL:-http://kibana:5601}")

for addr in "$EXPRESS_ADDR" "$ELASTIC_ADDR" "$KIBANA_ADDR"; do
  /wait-for-it.sh "$addr" --timeout=60 --strict -- echo "✅ $addr is up"
done

echo "📦 Installing dependencies..."
npm install

if [ ! -f users.json ]; then
  echo "🧪 Generating users.json..."
  node generate-users.js || { echo "❌ Failed to generate users"; exit 1; }
else
  echo "✅ users.json already exists. Skipping generation."
fi


