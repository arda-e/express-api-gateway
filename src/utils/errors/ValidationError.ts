import { AppError } from '@utils/errors/AppError';

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(400, message);
  }
}
