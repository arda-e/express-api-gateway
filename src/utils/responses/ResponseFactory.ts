import BaseModel from '@utils/Model';
import { StatusCodes } from 'http-status-codes';
import { Resource, ResourceLinks, Link } from '@utils/responses/resource';
import {
  InternalServerErrorResponse,
  NotFoundResponse,
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
} from '@utils/responses/error';
import { GetResponse, UpdateResponse } from '@utils/responses/crud';

/**
 * ResponseFactory class provides static methods to create standardized API responses.
 */
export class ResponseFactory {
  /**
   * Creates a resource response with HATEOAS links.
   * @param item The model instance to be wrapped in a Resource.
   * @param baseUrl The base URL for generating resource links.
   * @returns A tuple containing the status code and the Resource object.
   */
  static createResource<T extends BaseModel>(item: T, baseUrl: string): [number, Resource<T>] {
    const links = new ResourceLinks(new Link(`${baseUrl}/${item.id}`), {
      update: new Link(`${baseUrl}/${item.id}`, 'PUT'),
      delete: new Link(`${baseUrl}/${item.id}`, 'DELETE'),
    });
    return [
      StatusCodes.CREATED,
      new Resource(item.id, item.created_at, item.updated_at, links, item),
    ];
  }
  /**
   * Creates a response for a single resource retrieval.
   * @param resource The retrieved resource.
   * @param baseUrl The base URL for generating resource links.
   * @returns A tuple containing the status code and the GetResponse object.
   */
  static getSingleResource<T extends BaseModel<T>>(
    resource: T,
    baseUrl: string,
  ): [number, GetResponse<T>] {
    return [StatusCodes.OK, new GetResponse<T>(resource, baseUrl)];
  }
  /**
   * Creates a response for a successful delete operation.
   * @returns A tuple containing the status code and a boolean indicating success.
   */
  static createDeleteResponse(): [number, boolean] {
    return [StatusCodes.OK, true];
  }
  /**
   * Creates a response for a successful update operation.
   * @param updatedResource The updated resource.
   * @param baseUrl The base URL for generating resource links.
   * @returns A tuple containing the status code and the UpdateResponse object.
   */
  static createUpdateResponse<T extends Resource<T>>(
    updatedResource: T,
    baseUrl: string,
  ): [number, UpdateResponse<T>] {
    return [StatusCodes.OK, new UpdateResponse<T>(updatedResource, baseUrl)];
  }
  /**
   * Creates a Not Found error response.
   * @param message The error message.
   * @returns A tuple containing the status code and the NotFoundResponse object.
   */
  static createNotFoundResponse(message: string): [number, NotFoundResponse] {
    return [StatusCodes.NOT_FOUND, new NotFoundResponse(message)];
  }
  /**
   * Creates a Bad Request error response.
   * @param message The error message.
   * @returns A tuple containing the status code and the BadRequestResponse object.
   */
  static createBadRequestResponse(message: string): [number, BadRequestResponse] {
    return [StatusCodes.BAD_REQUEST, new BadRequestResponse(message)];
  }
  /**
   * Creates an Unauthorized error response.
   * @returns A tuple containing the status code and the UnauthorizedResponse object.
   */
  static createUnauthorizedResponse(): [number, UnauthorizedResponse] {
    return [StatusCodes.UNAUTHORIZED, new UnauthorizedResponse()];
  }
  /**
   * Creates a Forbidden error response.
   * @returns A tuple containing the status code and the ForbiddenResponse object.
   */
  static createForbiddenResponse(): [number, ForbiddenResponse] {
    return [StatusCodes.FORBIDDEN, new ForbiddenResponse()];
  }
  /**
   * Creates an Internal Server Error response.
   * @param error Optional Error object for additional details.
   * @returns A tuple containing the status code and the InternalServerErrorResponse object.
   */
  static createInternalServerErrorResponse(error?: Error): [number, InternalServerErrorResponse] {
    return [StatusCodes.INTERNAL_SERVER_ERROR, new InternalServerErrorResponse(error)];
  }
}
