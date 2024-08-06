export class ErrorResponse {
  status: number;
  message: string;
  stack?: string;

  constructor(status: number, message: string, error?: Error) {
    this.status = status;
    this.message = message;
    if (process.env.NODE_ENV !== 'production' && error?.stack) {
      this.stack = error.stack;
    }
  }
}
