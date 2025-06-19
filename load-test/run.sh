#!/bin/sh
set -e

npm run build
node dist/generate-users.js
k6 run --out xk6-output-elasticsearch=http://elasticsearch:9200/k6-results dist/k6-test.js
