
export interface DBManager {
    connect() : Promise<any>;
    disconnect() : Promise<void>;
    query(q: string) : Promise<QueryResult>;
    escapeValue(value : any) : string;
}

export type QueryResult = {
    error : any,
    results : any,
    fields : any,
}

