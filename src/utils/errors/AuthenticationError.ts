import { AppError } from '@utils/errors/AppError';

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message);
  }
}
