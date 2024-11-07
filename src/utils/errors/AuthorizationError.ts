import { AppError } from '@utils/errors/AppError';
export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(403, message);
  }
}
