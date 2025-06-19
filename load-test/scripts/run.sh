#!/bin/sh

set -e

cd /scripts

echo "📦 Installing dependencies..."
npm install

if [ ! -f users.json ]; then
  echo "🧪 Generating users.json..."
  node generate-users.js || { echo "❌ Failed to generate users"; exit 1; }
else
  echo "✅ users.json already exists. Skipping generation."
fi

# echo "🔍 Running health checks..."
# node health-check.js