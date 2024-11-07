export class DatabaseError extends Error {
  public statusCode: number;
  public detail?: string;

  constructor(message: string, statusCode: number, detail?: string) {
    super(message);
    this.name = this.constructor.name; // Set error name to the class name
    this.statusCode = statusCode;
    this.detail = detail;
    Error.captureStackTrace(this, this.constructor);
  }
}
