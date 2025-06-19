#!/bin/sh
set -e

npm run build
npm run check
node dist/generate-users.js
k6 run --out xk6-output-elasticsearch=${ELASTIC_URL:-http://localhost:9200}/k6-results dist/k6-test.js
