import { Knex } from 'knex';
import { PermissionActions, RoleActions, UserActions } from '@utils/enums';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('authentication.permissions').del();
  //
  // const count = await knex('authentication.permissions').count('id as count').first();
  //
  // if (count && count.count !== '0') {
  //   return; // Early return if table is not empty
  // }

  const allActions = [
    ...Object.values(UserActions),
    ...Object.values(RoleActions),
    ...Object.values(PermissionActions),
  ];

  const permissionsData = allActions.map((action) => ({
    name: action,
    description: `Permission to ${action.replace(':', ' ')}`,
  }));

  // Inserts seed entries
  await knex('authentication.permissions').insert(permissionsData);
}
