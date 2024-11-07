import { AppError } from '@utils/errors/AppError';

export class ResourceAlreadyExistsError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(409, message);
  }
}
