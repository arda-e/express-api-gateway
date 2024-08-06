export class Link {
    href: string;
    method?: string;

    constructor(href: string, method?: string) {
        this.href = href;
        this.method = method;
    }
}