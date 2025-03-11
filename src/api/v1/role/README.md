# Roles Model Documentation

## Roles Model Relationships

The Roles model is a core part of the access control system with the following relationships:

### Roles → Permissions (Many-to-Many)

- Roles are assigned multiple permissions.
- Connection through `authentication.role_permissions` junction table.
- Enables structured and scalable access control.

### Users → Roles (Many-to-Many)

- Users are assigned roles.
- Connection through `authentication.user_roles` table.
- Users inherit permissions from assigned roles.

## Database Schema

```sql
authentication.roles
├── id (UUID, PK)
├── name (VARCHAR, UNIQUE)
├── description (VARCHAR, OPTIONAL)
├── is_active (BOOLEAN, DEFAULT: TRUE)

authentication.role_permissions
├── id (UUID, PK)
├── role_id (UUID, FK → roles.id)
└── permission_id (UUID, FK → permissions.id)

authentication.user_roles
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
└── role_id (UUID, FK → roles.id)

authentication.permissions
├── id (UUID, PK)
├── name (VARCHAR, UNIQUE)
└── description (VARCHAR, OPTIONAL)

authentication.users
├── id (UUID, PK)
├── username (VARCHAR)
├── email (VARCHAR, UNIQUE)
└── password (VARCHAR)
```
