import { Knex } from 'knex';
import { RoleActions, UserActions, PermissionActions } from '@utils/enums';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex('authentication.user_roles').del();
  await knex('authentication.role_permissions').del();
  await knex('authentication.roles').del();

  // Insert roles
  const roles = [
    { name: 'Admin', description: 'Administrator with full access' },
    { name: 'User', description: 'Regular user with limited access' },
  ];

  const [adminRole, userRole] = await knex('authentication.roles').insert(roles).returning('id');

  // Fetch all permissions
  const permissions = await knex('authentication.permissions').select('id', 'name');
  const permissionMap = new Map(permissions.map((p) => [p.name, p.id]));

  // Define role permissions
  const rolePermissions = [
    {
      roleId: adminRole.id,
      permissions: [
        ...Object.values(UserActions),
        ...Object.values(RoleActions),
        ...Object.values(PermissionActions),
      ],
    },
    {
      roleId: userRole.id,
      permissions: [UserActions.READ_OWN_PROFILE, UserActions.UPDATE_OWN_PROFILE],
    },
  ];

  // Prepare role_permissions data
  const rolePermissionsData = rolePermissions
    .flatMap((rp) =>
      rp.permissions.map((p) => ({
        roleId: rp.roleId,
        permissionId: permissionMap.get(p),
      })),
    )
    .filter((rp) => rp.permissionId !== undefined);

  // Insert role_permissions
  await knex('authentication.role_permissions').insert(rolePermissionsData);
}
