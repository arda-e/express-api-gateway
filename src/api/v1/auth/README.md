# Auth Model Documentation

## User Model Relationships

The User model serves as a central entity in the authentication system with the following relationships:

### User → Roles (Many-to-Many)

- Users can have multiple roles
- Connection through `authentication.user_roles` junction table
- Roles provide groupings of permissions
- Users are assigned the `User` role by default

### User → Permissions (Many-to-Many through Roles)

- Users inherit permissions through their assigned roles
- Permissions are linked to roles through `authentication.role_permissions` table
- Enables granular access control across the system

## Database Schema

```sql
authentication.users
├── id (UUID, PK)
├── username (VARCHAR)
├── email (VARCHAR, UNIQUE)
└── password (VARCHAR)

authentication.user_roles
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
└── role_id (UUID, FK → roles.id)

authentication.roles
├── id (UUID, PK)
└── name (VARCHAR)

authentication.role_permissions
├── id (UUID, PK)
├── role_id (UUID, FK → roles.id)
└── permission_id (UUID, FK → permissions.id)

authentication.permissions
├── id (UUID, PK)
└── name (VARCHAR)
```

# Authentication Module

This module handles user authentication and management for the API gateway.

## Features

- User registration
- User login and session management
- User profile management
- Role-based access control integration

## Database Transactions

This module uses transaction decorators to ensure data consistency for critical operations:

- User registration (creating a user and assigning roles in a single transaction)
- User updates (checking uniqueness and updating data in a transaction)
- User deletion (removing the user and associated data in a transaction)

## Architecture

The authentication module follows a layered architecture:

1. **Controllers** (`auth.controller.ts`): Handle HTTP requests and responses
2. **Services** (`auth.service.ts`): Implement business logic
3. **Repositories** (`auth.repository.ts`): Interact with the database
4. **Models** (`auth.model.ts`): Define data structures
5. **DTOs** (`auth.dtos.ts`): Define data transfer objects

## Transaction Flow

When a user registration request is made:

1. The controller receives the registration request
2. The service's `register` method is called with the `@Transaction()` decorator
3. The decorator creates a transaction and passes it to the method
4. The service uses the transaction to:
   - Check if the user exists
   - Create the user
   - Assign roles to the user
5. If any step fails, the entire transaction is rolled back
6. If all steps succeed, the transaction is committed

## Usage

### Registration

```typescript
POST / api / v1 / auth / register;
```

Request body:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

### Login

```typescript
POST / api / v1 / auth / login;
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

### Get Current User

```typescript
GET / api / v1 / auth / me;
```

### Update User

```typescript
PUT / api / v1 / auth / me;
```

Request body:

```json
{
  "username": "new_username",
  "email": "new_email@example.com"
}
```

### Delete User

```typescript
DELETE / api / v1 / auth / me;
```
