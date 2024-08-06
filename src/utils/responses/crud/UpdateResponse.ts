import { Resource } from '../resource/Resource';

export class UpdateResponse<T extends Resource<T>> {
  [key: string]: any;

  constructor(updatedResource: T, baseUrl: string) {
    Object.assign(this, updatedResource);
  }
}
