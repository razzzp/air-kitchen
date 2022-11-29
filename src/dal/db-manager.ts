import mysql from 'mysql'

export interface DBManager {
    connect() : Promise<mysql.Connection>;
    disconnect() : Promise<void>;
    query(q: string) : Promise<MySQLQueryResult>;
}

export type MySQLQueryResult = {
    error : mysql.MysqlError,
    results : any,
    fields : mysql.FieldInfo[],
}

