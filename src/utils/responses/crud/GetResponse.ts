import BaseModel from '@utils/Model';

export class GetResponse<T extends BaseModel> {
  [key: string]: any;
  constructor(resource: T, baseUrl: string) {
    Object.assign(this, resource);
  }
}
