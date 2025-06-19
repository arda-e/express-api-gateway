# Express API Gateway

A robust, scalable API Gateway built with Express.js and TypeScript implementing a comprehensive authentication and authorization system with role-based access control.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Contributing](#contributing)

## Features

- **Robust Authentication System**:
  - User registration and login
  - JWT-based authentication
  - Password hashing and validation
  - Profile management (view, update, delete)
- **Role-Based Access Control (RBAC)**:

  - Role management
  - Permission management
  - Fine-grained access control

- **Database Integration**:
  - PostgreSQL integration via Knex.js
  - Repository pattern implementation
  - Transaction support
- **Caching**:

  - Redis integration for caching
  - Performance optimization

- **Logging and Monitoring**:

  - Advanced logging with Winston
  - Log rotation and management
  - Error handling and reporting

- **Dependency Injection**:
  - Inversion of Control (IoC) container
  - Testability and modularity

## Architecture

### Project Structure

The application follows a modular architecture with separation of concerns:

- **API Layer**: Contains controllers, DTOs and routes
- **Service Layer**: Business logic implementation
- **Repository Layer**: Data access logic
- **Domain Layer**: Entity definitions and business rules
- **Infrastructure Layer**: Database connectivity, caching, logging

### Core Components

1. **Authentication System**:

   - AuthService, AuthRepository for user management
   - JWT-based authentication

2. **Role & Permission System**:

   - RoleService, PermissionService for managing roles and permissions
   - Role-user and role-permission relationships

3. **Database Management**:

   - KnexAdapter for PostgreSQL connectivity
   - Database migrations and connection handling
   - Retry mechanism for DB connections

4. **Caching**:

   - RedisManager for caching
   - Session management

5. **Logging**:
   - LoggerFactory for centralized logging
   - Daily log rotation

## Prerequisites

- Docker and Docker Compose
- Node.js v14+ (for local development)
- PostgreSQL
- Redis

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/express-api-gateway.git
cd express-api-gateway
```

2. Install dependencies:

```bash
npm install
```

## Environment Configuration

Create environment files based on your requirements:

- `.env.dev` - Development environment
- `.env.prod` - Production environment

Example configuration:

```
# App
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=api_gateway
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app-%DATE%.log
```

`REDIS_HOST` and `REDIS_PORT` control the address of the Redis instance used for session storage. If these variables are not set, the gateway defaults to `redis` and `6379`.

## Running the Application

### Development

For building the development environment:

```bash
docker-compose -f docker-compose.dev.yml --env-file .env.dev up --build
```

### Production

For building the production environment:

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build
```

## API Documentation

API documentation is available at:
Feature folders in the src/api/v1 folder

## Development Guide

### Database Migrations

The application uses Knex.js for database migrations. To create and run migrations:

```bash
# Create a new migration
npm run migrate:make -- migration_name

# Run migrations
npm run migrate:latest

# Rollback migrations
npm run migrate:rollback
```

### Logging

The application uses Winston for logging. Logs are stored in daily-rotated files:

- Use `LoggerFactory.getLogger()` to get a logger instance.
- Log levels: error, warn, info, debug

### Error Handling

Custom error classes:

- `AuthenticationError` - Authentication failures
- `ResourceDoesNotExistError` - Resource not found
- `UniqueConstraintError` - Database uniqueness violations
- `DatabaseError` - Database operation failures

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
