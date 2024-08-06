import {Link} from "@utils/responses/resource/Link";

export class ResourceLinks {
    self: Link;
    [key: string]: Link;

    constructor(self: Link, additionalLinks: { [key: string]: Link } = {}) {
        this.self = self;
        Object.assign(this, additionalLinks);
    }
}