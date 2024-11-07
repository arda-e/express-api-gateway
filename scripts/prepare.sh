#!/bin/bash
set -e

npx ts-node ./node_modules/.bin/knex migrate:latest --knexfile src/config/knexfile.ts
npx ts-node ./node_modules/.bin/knex seed:run --knexfile src/config/knexfile.ts

exec "$@"

