import { StatusCodes } from 'http-status-codes';

import BaseModel from '../Model';
import { ApiResponse } from './ApiResponse';

class ResponseBuilder<T> {
  private response: ApiResponse<T> = {
    status: 'success',
    statusCode: StatusCodes.OK,
    message: '',
  };

  setStatus(status: 'success' | 'error'): this {
    this.response.status = status;
    return this;
  }

  setStatusCode(code: number): this {
    this.response.statusCode = code;
    return this;
  }

  setData(data: T): this {
    this.response.data = data;
    return this;
  }

  setMessage(message: string): this {
    this.response.message = message;
    return this;
  }

  setLinks(baseUrl: string, item: BaseModel): this {
    this.response.links = {
      self: { href: `${baseUrl}/${item.id}` },
      update: { href: `${baseUrl}/${item.id}`, method: 'PUT' },
      delete: { href: `${baseUrl}/${item.id}`, method: 'DELETE' },
    };
    return this;
  }

  build(): ApiResponse<T> {
    return this.response;
  }
}

export default ResponseBuilder;
