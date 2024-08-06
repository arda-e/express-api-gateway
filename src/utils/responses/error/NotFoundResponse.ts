import { ErrorResponse } from './ErrorResponse';

export class NotFoundResponse extends ErrorResponse {
  constructor(message: string) {
    super(404, message);
  }
}
