export * from './ErrorTypes';

import { AppError } from './AppError';

export class RouteNotFoundError extends AppError {
  constructor(message: string = 'Route not found') {
    super(404, message);
  }
}

export class ResourceDoesNotExistError extends AppError {
  constructor(message: string = 'Resource does not exist') {
    super(404, message);
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(message: string = 'User already exists') {
    super(409, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(403, message);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database error occurred') {
    super(500, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message);
  }
}
