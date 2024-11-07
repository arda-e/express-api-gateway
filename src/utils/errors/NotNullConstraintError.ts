import { DatabaseError } from './DatabaseError';

export class NotNullConstraintError extends DatabaseError {
  constructor(detail?: string) {
    super('Missing required user data', 400, detail); // 400 Bad Request
  }
}
