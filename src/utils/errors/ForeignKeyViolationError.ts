import { DatabaseError } from './DatabaseError';

export class ForeignKeyViolationError extends DatabaseError {
  constructor(detail?: string) {
    super('Foreign key violation', 400, detail); // General message for broader use
  }
}
