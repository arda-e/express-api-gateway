export enum EventType {
  UserRegistered = "UserRegistered",
  PermissionUpdated = "PermissionUpdated",
}

interface JobMetadata {
  requeuedAt?: string;
  originalJobId?: string;
  retryContext?: {
    reason: string;
    failedAt: string;
  };
}

export interface BasePayload {
  userId: string;
  meta?: JobMetadata;
}

export interface UserRegisteredPayload extends BasePayload {
  email: string;
}

export interface PermissionUpdatedPayload extends BasePayload {
  permissionId: string;
  changedBy: string;
}

export type EventPayloadMap = {
  [EventType.UserRegistered]: UserRegisteredPayload;
  [EventType.PermissionUpdated]: PermissionUpdatedPayload;
};
