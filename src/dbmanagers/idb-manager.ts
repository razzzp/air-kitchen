
export interface IDBManager {
    connect() : Promise<any>;
    disconnect() : Promise<void>;
    query(q: string) : Promise<TQueryResult>;
    escapeValue(value : any) : string;
}

export type TQueryResult = {
    error : any,
    results : any,
    fields : any,
}

