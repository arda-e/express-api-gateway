import { StatusCodes } from 'http-status-codes';

import ResponseBuilder from './ResponseBuilder';
import BaseModel from '../Model';
import { ResourceResponse, ListResponse, DeleteResponse, ErrorResponse } from './ResponseTypes';

export class ResponseFactory {
  static createResource<T extends BaseModel>(item: T, baseUrl: string): ResourceResponse<T> {
    return new ResponseBuilder<T>()
      .setStatus('success')
      .setStatusCode(StatusCodes.CREATED)
      .setData(item)
      .setLinks(baseUrl, item)
      .setMessage('Resource created successfully')
      .build();
  }

  static getSingleResource<T extends BaseModel>(resource: T, baseUrl: string): ResourceResponse<T> {
    return new ResponseBuilder<T>()
      .setStatus('success')
      .setStatusCode(StatusCodes.OK)
      .setData(resource)
      .setLinks(baseUrl, resource)
      .setMessage('Resource retrieved successfully')
      .build();
  }

  static getListResource<T extends BaseModel>(resources: T[], baseUrl: string): ListResponse<T> {
    return new ResponseBuilder<T[]>()
      .setStatus('success')
      .setStatusCode(StatusCodes.OK)
      .setData(resources)
      .setMessage('Resources retrieved successfully')
      .build();
  }

  static createDeleteResponse(): DeleteResponse {
    return new ResponseBuilder<{ deleted: boolean }>()
      .setStatus('success')
      .setStatusCode(StatusCodes.OK)
      .setData({ deleted: true })
      .setMessage('Resource deleted successfully')
      .build();
  }

  static createUpdateResponse<T extends BaseModel>(
    updatedResource: T,
    baseUrl: string,
  ): ResourceResponse<T> {
    return new ResponseBuilder<T>()
      .setStatus('success')
      .setStatusCode(StatusCodes.OK)
      .setData(updatedResource)
      .setLinks(baseUrl, updatedResource)
      .setMessage('Resource updated successfully')
      .build();
  }

  static createErrorResponse(statusCode: number, message: string): ErrorResponse {
    return new ResponseBuilder<null>()
      .setStatus('error')
      .setStatusCode(statusCode)
      .setMessage(message)
      .build();
  }

  static createBadRequestResponse(message: string = 'Bad Request'): ErrorResponse {
    return this.createErrorResponse(StatusCodes.BAD_REQUEST, message);
  }

  static createNotFoundResponse(message: string = 'Resource not found'): ErrorResponse {
    return this.createErrorResponse(StatusCodes.NOT_FOUND, message);
  }

  static createUnauthorizedResponse(message: string = 'Unauthorized'): ErrorResponse {
    return this.createErrorResponse(StatusCodes.UNAUTHORIZED, message);
  }

  static createForbiddenResponse(message: string = 'Forbidden'): ErrorResponse {
    return this.createErrorResponse(StatusCodes.FORBIDDEN, message);
  }

  static createInternalServerErrorResponse(
    message: string = 'Internal Server Error',
  ): ErrorResponse {
    return this.createErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, message);
  }
}
