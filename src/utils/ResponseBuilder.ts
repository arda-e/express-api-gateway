import { ApiResponse } from "./Response";

export class ResponseBuilder<T> {
  private _status: "success" | "error" = "success";
  private _statusCode: number = 200;
  private _message: string = "Success";
  private _data?: T;
  private _errorCode?: string;
  private _errors?: Array<{ field: string; errors: string[] }>;

  setStatus(status: "success" | "error"): this {
    this._status = status;
    return this;
  }

  setStatusCode(statusCode: number): this {
    this._statusCode = statusCode;
    return this;
  }

  setMessage(message: string): this {
    this._message = message;
    return this;
  }

  setData(data: T): this {
    this._data = data;
    return this;
  }

  setErrorCode(errorCode: string): this {
    this._errorCode = errorCode;
    return this;
  }

  setErrors(errors: Array<{ field: string; errors: string[] }>): this {
    this._errors = errors;
    return this;
  }

  build(): ApiResponse<T> {
    return new ApiResponse(
      this._status,
      this._statusCode,
      this._message,
      this._data,
      this._errorCode,
      this._errors,
    );
  }
}
