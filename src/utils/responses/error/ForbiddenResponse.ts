import { ErrorResponse } from './ErrorResponse';

export class ForbiddenResponse extends ErrorResponse {
    constructor() {
        super(403, 'Forbidden');
    }
}
