class CustomError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

/**
 * Creates a custom error with the specified status code and message.
 *
 * @param status - The HTTP status code for the error.
 * @param message - The error message.
 * @returns A new `CustomError` instance.
 */
const createError = (status: number, message: string) => {
    return new CustomError(status, message);
};

export { CustomError, createError };