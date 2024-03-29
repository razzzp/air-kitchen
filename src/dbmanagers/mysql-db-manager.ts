import { IDBManager, TQueryResult } from "./idb-manager";
import mysql from 'mysql';
import dotenv from 'dotenv';

export class MySQLDBManager implements IDBManager{

    _connectionConfig : mysql.ConnectionConfig;
    _connection : mysql.Connection = null;

    constructor(connectionConfig : mysql.ConnectionConfig){
        this._connectionConfig = connectionConfig;
    }
    
    async connect() : Promise<mysql.Connection> {
        if (this._connection === null) {
            // if no connection has been created yet, create one
            this._connection = mysql.createConnection(this._connectionConfig);
            return new Promise<mysql.Connection>((resolve, reject) => this._connection.connect((err) => {
                if(err) {
                    // reset connect to null, if cannot connect
                    this._connection = null;
                    reject(err);
                } else {
                    // return connection object
                    resolve(this._connection);
                }
            }));
        }
        return this._connection;
    }

    async query(q: string) : Promise<TQueryResult>{
        const conn = await this.connect();
        return new Promise((resolve, reject) => conn.query(q, (error, results, fields)=> {
            if(error) {
                reject(error);
            } else {
                resolve({error : null, results : results, fields : fields}); 
            }
        }));
    }

    async disconnect() : Promise<void> {
        if(this._connection === null) return;

        this._connection.destroy();
        this._connection = null;
        return;
    }

    /**
     * calls escape method in connection
     * only call when connected
     */
    public escapeValue(value : any) : string {
        if(this._connection === null) throw new Error("db is not connected");
        
        return mysql.escape(value);
    }
}

let _dbManager : IDBManager = null;

export function getDBManager(){
    dotenv.config();
    if(_dbManager === null) {
        _dbManager = new MySQLDBManager({
            host:'localhost',
            port : Number.parseInt(process.env.MYSQL_PORT),
            user     : process.env.MYSQL_USER,
            password : process.env.MYSQL_PASS
        });
    }
    return _dbManager;
}