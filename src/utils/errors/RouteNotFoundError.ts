import { ErrorType } from "@utils/errors/ErrorTypes";

export class RouteNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = ErrorType.ROUTE_NOT_FOUND;
    }
}