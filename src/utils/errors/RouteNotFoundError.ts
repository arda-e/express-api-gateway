import { AppError } from '@utils/errors/AppError';

export class RouteNotFoundError extends AppError {
  constructor(message: string = 'Route not found') {
    super(404, message);
  }
}
