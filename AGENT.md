# Agent Development Guide

## Commands

- **Build**: `npm run build` (compiles TypeScript to dist/)
- **Test**: `npm test` (runs Jest tests), `npm run test:watch` (watch mode)
- **Lint**: `npm run lint` (ESLint), `npm run lint:fix` (auto-fix)
- **Format**: `npm run format` (Prettier)
- **Dev**: `npm run dev` (tsx watch with debugging on port 9229)
- **Start**: `npm start` (production), `npm run start:worker` (queue worker)
- **DB**: `npm run migrate` (run Knex migrations)

## Architecture

- **Express API Gateway** with TypeScript, PostgreSQL, Redis, BullMQ queues
- **Structure**: `/src/api/v1/` (REST endpoints), `/src/db/` (Knex migrations/seeds), `/src/utils/` (shared utilities), `/src/middlewares/` (Express middleware), `/src/config/` (app configuration)
- **Auth**: JWT tokens with bcrypt hashing, session management with Redis
- **UI**: React SSR with entry-server rendering
- **Queue**: BullMQ with Redis for background jobs
- **Logging**: Winston with daily rotation

## Code Style

- **TypeScript**: Strict mode, decorators enabled for dependency injection (tsyringe)
- **Imports**: Use path aliases (`@api/*`, `@utils/*`, `@config/*`, `@db/*`, `@middlewares/*`)
- **Import order**: builtin → external → internal with newlines between groups
- **Validation**: Zod schemas for runtime validation, express-validator for request validation
- **Error handling**: Use http-status-codes constants, structured error responses
- **Formatting**: Prettier with default config, ESLint with TypeScript rules
