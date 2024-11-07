import { AppError } from '@utils/errors/AppError';

export class ResourceDoesNotExistError extends AppError {
  constructor(message: string = 'Resource does not exist') {
    super(404, message);
  }
}
