import { ErrorResponse } from './ErrorResponse';

export class InternalServerErrorResponse extends ErrorResponse {
    constructor(error: Error) {
        super(500, 'Internal Server Error', error);
    }
}
