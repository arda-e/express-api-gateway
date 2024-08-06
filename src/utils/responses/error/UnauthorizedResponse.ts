import { ErrorResponse } from './ErrorResponse';

export class UnauthorizedResponse extends ErrorResponse {
  constructor() {
    super(401, 'Unauthorized');
  }
}
