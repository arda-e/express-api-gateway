# Stage 1: Base Stage
FROM node:18 AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .


# Stage 2: Development Stage
FROM base AS development
RUN npm install -g tsx knex
ENV NODE_ENV=development
EXPOSE 8000 9229
COPY scripts/wait-for-it.sh /usr/src/app/scripts/wait-for-it.sh

CMD ["/usr/src/app/scripts/wait-for-it.sh", "postgres:5432", "--", "sh", "-c", "npx ts-node ./node_modules/.bin/knex migrate:latest --knexfile src/config/knexfile.ts  && tsx watch --inspect=0.0.0.0:9229 src/index.ts"]

# Stage 3: Production Stage
FROM base AS production
ENV NODE_ENV=production
COPY . .
RUN npm run build
COPY scripts/wait-for-it.sh /usr/src/app/scripts/wait-for-it.sh

EXPOSE 8000

CMD ["/usr/src/app/scripts/wait-for-it.sh", "postgres:5432", "--", "node", "dist/index.js"]
