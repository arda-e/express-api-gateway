import { ResourceLinks } from '@utils/responses/resource/ResourceLink';
import BaseModel from '@utils/Model';

export class Resource<T extends BaseModel> {
  id: number;
  created_at: Date;
  updated_at: Date;
  links: ResourceLinks;
  [key: string]: any;

  constructor(
    id: number,
    createdAt: Date,
    updatedAt: Date,
    links: ResourceLinks,
    additionalAttributes: T,
  ) {
    this.id = id;
    this.created_at = createdAt;
    this.updated_at = updatedAt;
    this.links = links;
    Object.assign(this, additionalAttributes);
  }
}
