export enum UserActions {
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',
  READ_OWN_PROFILE = 'read:own-profile',
  UPDATE_OWN_PROFILE = 'update:own-profile',
}

export enum RoleActions {
  CREATE_ROLE = 'create:role',
  READ_ROLE = 'read:role',
  UPDATE_ROLE = 'update:role',
  DELETE_ROLE = 'delete:role',
  ASSIGN_ROLE = 'assign:role',
  REMOVE_ROLE = 'remove:role',
}

export enum PermissionActions {
  CREATE_PERMISSION = 'create:permission',
  READ_PERMISSION = 'read:permission',
  UPDATE_PERMISSION = 'update:permission',
  DELETE_PERMISSION = 'delete:permission',
  ASSIGN_PERMISSION = 'assign:permission',
  REMOVE_PERMISSION = 'remove:permission',
}
