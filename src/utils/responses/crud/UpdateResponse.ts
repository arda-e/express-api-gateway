import { Resource } from '../resource/Resource';
import BaseModel from '@utils/Model';
import {ResponseFactory} from "@utils/responses/ResponseFactory";

export class UpdateResponse<T extends Resource> {
    [key: string]: any;

    constructor(updatedResource: T, baseUrl: string) {
        Object.assign(this, updatedResource);
    }
}
