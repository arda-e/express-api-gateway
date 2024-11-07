# Auth Model Documentation

## User Model Relationships

The User model serves as a central entity in the authentication system with the following relationships:

### User → Roles (Many-to-Many)

- Users can have multiple roles
- Connection through `authentication.user_roles` junction table
- Roles provide groupings of permissions
- Default role ID: 'cbd0bdfe-6240-4a9d-8882-e1df7a9938ed' (!TODO: FIX)

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
