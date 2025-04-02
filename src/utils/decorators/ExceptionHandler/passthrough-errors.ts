import * as Errors from "@utils/errors";

export const DEFAULT_PASSTHROUGH_ERRORS = [
  Errors.ResourceDoesNotExistError,
  Errors.ResourceAlreadyExistsError,
  Errors.ValidationError,
  Errors.AuthenticationError,
  Errors.AuthorizationError,
  Errors.ForeignKeyViolationError,
  Errors.NotNullConstraintError,
  Errors.UniqueConstraintError,
  Errors.CheckViolationError,
  Errors.DataFormatError,
  Errors.SyntaxOrReferenceError,
  Errors.DatabaseAuthError,
  Errors.OtherDatabaseError,
  Errors.OtherDbFallbackError,
  Errors.AppError,
];
