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
# Use the Alpine variant for a smaller final image
FROM node:18-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy only lock files for reliable, cached installs
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Copy the compiled output only
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --chown=node:node scripts/wait-for-it.sh ./scripts/wait-for-it.sh

EXPOSE 8000

# Drop root privileges for security
USER node

CMD ["./scripts/wait-for-it.sh", "postgres:5432", "--", "node", "dist/index.js"]


