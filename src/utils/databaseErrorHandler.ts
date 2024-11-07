import {
  ForeignKeyViolationError,
  NotNullConstraintError,
  UniqueConstraintError,
} from '@utils/errors/';

/**
 * Handles database errors by throwing specific exceptions based on error codes.
 *
 * @param {any} error - The error object thrown by the database operation.
 * @return {never} - This function always throws and thus never returns.
 */
export function handleDatabaseError(error: any): never {
  switch (error.code) {
    case '23505':
      const field = extractFieldNameFromDetail(error.detail) || 'unknown field';
      throw new UniqueConstraintError(field, error.detail);
    case '23503': // Foreign key violation
      throw new ForeignKeyViolationError('Invalid foreign key reference');
    case '23502': // Not-null constraint violation
      throw new NotNullConstraintError('Missing required field');
    default:
      throw error;
  }
}

/**
 * Extracts and returns the field name from the given detail string.
 *
 * @param {string} detail - The detail string from which to extract the field name.
 * @return {string|null} The extracted field name, or null if no match is found.
 */
function extractFieldNameFromDetail(detail: string): string | null {
  const match = detail.match(/Key \((.*?)\)=/);
  return match ? match[1] : null;
}
