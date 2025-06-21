# Build Stage
FROM node:18 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npx tsup

# Development Stage
FROM build AS development
RUN npm install -g tsx knex @types/node
ENV NODE_ENV=development
EXPOSE 8000 9229
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/health/ready || exit 1
CMD ["./scripts/wait-for-it.sh", "postgres:5432", "--", "sh", "-c", "./scripts/docker/prepare.sh ./scripts/docker/start-app.sh"]

# Production Stage
FROM node:18-slim AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /usr/src/app/dist ./dist
COPY scripts/wait-for-it.sh ./scripts/wait-for-it.sh
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/health/ready || exit 1
CMD ["./scripts/wait-for-it.sh", "postgres:5432", "--", "sh", "-c", "./scripts/docker/start-app.sh"]

