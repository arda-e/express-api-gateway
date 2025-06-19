#!/bin/sh
set -e

chmod +x /wait-for-it.sh

echo "Waiting for Elasticsearch..."
/wait-for-it.sh elasticsearch:9200 --timeout=600 --strict

echo "Starting Kibana..."
/bin/tini -- /bin/bash /usr/share/kibana/bin/kibana