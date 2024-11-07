import { DatabaseError } from './DatabaseError';

export class UniqueConstraintError extends DatabaseError {
  constructor(field: string, detail?: string) {
    super(`Unique constraint violated on ${field}`, 409, detail); // 409 Conflict status code
  }
}
