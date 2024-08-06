import { ErrorResponse } from './ErrorResponse';

export class BadRequestResponse extends ErrorResponse {
    constructor(message: string) {
        super(400, message);
    }
}