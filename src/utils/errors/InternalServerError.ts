import { AppError } from '@utils/errors/AppError';

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message);
  }
}
