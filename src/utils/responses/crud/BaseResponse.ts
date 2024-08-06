import BaseModel from "@utils/Model";

export class BaseResponse<T extends BaseModel> {
    protected generateLinks(item: T): Record<string, { href: string }> {
        return {
            self: { href: `/api/v1/${item.constructor.name.toLowerCase()}s/${item.id}` }
        };
    }
}