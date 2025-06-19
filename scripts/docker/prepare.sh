#!/bin/bash
set -e

NODE_ENV=development npx ts-node -r tsconfig-paths/register ./node_modules/knex/bin/cli.js migrate:latest --knexfile src/config/knexfile.ts
NODE_ENV=development npx ts-node -r tsconfig-paths/register ./node_modules/knex/bin/cli.js seed:run --knexfile src/config/knexfile.ts

exec "$@"
