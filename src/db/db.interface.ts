export interface Database {
    initialize(): Promise<void>;
    getInstance(): any;
    query(queryString: string, params?: any[]): Promise<any>;
    close(): Promise<void>;
}