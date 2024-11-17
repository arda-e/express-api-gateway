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
  private _status: 'success' | 'error' = 'success';
  private statusCode: number = 200;
  private _message: string = '';
  private _data: unknown = null;
  private _errorCode: string | null = null;
  private _errors: Array<{ field: string; errors: string[] }> | null = null;

  public setStatus(status: 'success' | 'error'): this {
    this._status = status;
    return this;
  }

  setErrors(errors: Array<{ field: string; errors: string[] }>): this {
    this._errors = errors;
    return this;
  }

  setStatusCode(statusCode: number): this {
    this.statusCode = statusCode;
    return this;
  }

  setMessage(message: string): this {
    this._message = message;
    return this;
  }

  setData(data: unknown): this {
    this._data = data;
    return this;
  }

  setErrorCode(errorCode: string | number): this {
    this._errorCode = String(errorCode);
    return this;
  }

  build(): IResponse {
    const response = {
      status: this._status,
      statusCode: this.statusCode,
      message: this._message,
    };

    if (this._errors) {
      (response as IResponse).errors = this._errors;
    }

    if (this._data !== null) {
      (response as IResponse).data = this._data;
    }

    if (this._status === 'error' && this._errorCode) {
      (response as IResponse).errorCode = this._errorCode;
    }

    return response;
  }

  public get getStatusCode() {
    return this.statusCode;
  }

  public get status(): 'success' | 'error' {
    return this._status;
  }

  get message(): string {
    return this._message;
  }

  get data(): unknown {
    return this._data;
  }

  get errorCode(): string | null {
    return this._errorCode;
  }

  get errors(): Array<{ field: string; errors: string[] }> | null {
    return this._errors;
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
