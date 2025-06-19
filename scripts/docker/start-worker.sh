#!/bin/sh
set -e

chmod +x /wait-for-it.sh

/wait-for-it.sh express:8000 --timeout=120 --strict

echo "Starting worker..."
exec npm run start:worker
