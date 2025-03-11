# Permissions Model Documentation

## Permissions Model Relationships

The Permissions model is a core part of the access control system with the following relationships:

### Roles → Permissions (Many-to-Many)

- Permissions are assigned to roles.
- Connection through `authentication.role_permissions` junction table.
- Allows granular access control based on user roles.

### Users → Permissions (Many-to-Many through Roles)

- Users inherit permissions through their assigned roles.
- Permissions are linked to roles through `authentication.role_permissions`.

## Database Schema

```sql
authentication.permissions
├── id (UUID, PK)
├── name (VARCHAR, UNIQUE)
└── description (VARCHAR)

authentication.role_permissions
├── id (UUID, PK)
├── role_id (UUID, FK → roles.id)
└── permission_id (UUID, FK → permissions.id)

authentication.roles
├── id (UUID, PK)
└── name (VARCHAR)

authentication.user_roles
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
└── role_id (UUID, FK → roles.id)

authentication.users
├── id (UUID, PK)
├── username (VARCHAR)
├── email (VARCHAR, UNIQUE)
└── password (VARCHAR)
```
