import { ErrorType } from '@utils/errors/ErrorTypes';

export class ResourceDoesNotExistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ErrorType.RESOURCE_DOES_NOT_EXIST;
  }
}
