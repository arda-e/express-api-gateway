interface IResponseBuilder {
  setStatus(status: 'success' | 'error'): this;

  setStatusCode(statusCode: number): this;

  setMessage(message: string): this;

  setData(data: unknown): this;

  setErrorCode(errorCode: string): this;

  setErrors(errors: Array<{ field: string; errors: string[] }>): this;

  build(): IResponse;
}

interface IResponse {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data?: unknown;
  errorCode?: string;
  errors?: Array<{ field: string; errors: string[] }>;
}

/**
 * ResponseBuilder is a utility class for constructing a consistent response object.
 * It implements the IResponseBuilder interface and provides a fluent API for setting
 * various properties of the response.
 */
export class ResponseBuilder implements IResponseBuilder {
  private status: 'success' | 'error' = 'success';
  private statusCode: number = 200;
  private message: string = '';
  private data: unknown = null;
  private errorCode: string | null = null;
  private errors: Array<{ field: string; errors: string[] }> | null = null;

  setStatus(status: 'success' | 'error'): this {
    this.status = status;
    return this;
  }

  setErrors(errors: Array<{ field: string; errors: string[] }>): this {
    this.errors = errors;
    return this;
  }

  setStatusCode(statusCode: number): this {
    this.statusCode = statusCode;
    return this;
  }

  setMessage(message: string): this {
    this.message = message;
    return this;
  }

  setData(data: unknown): this {
    this.data = data;
    return this;
  }

  setErrorCode(errorCode: string | number): this {
    this.errorCode = String(errorCode);
    return this;
  }

  build(): IResponse {
    const response = {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
    };

    if (this.errors) {
      (response as IResponse).errors = this.errors;
    }

    if (this.data !== null) {
      (response as IResponse).data = this.data;
    }

    if (this.status === 'error' && this.errorCode) {
      (response as IResponse).errorCode = this.errorCode;
    }

    return response;
  }
}

/**
 * ErrorResponseBuilder is a specialized builder that constructs
 * error responses with a status, status code, and message.
 *
 * Extends:
 * ResponseBuilder
 *
 * Constructor:
 * - Accepts a statusCode and a message as parameters.
 *
 * Methods:
 * - setStatus: Sets the status to 'error'.
 * - setStatusCode: Sets the provided status code.
 * - setMessage: Sets the provided message.
 */
export class ErrorResponseBuilder extends ResponseBuilder {
  constructor(statusCode: number, message: string) {
    super();
    this.setStatus('error').setStatusCode(Number(statusCode)).setMessage(message);
  }
}
