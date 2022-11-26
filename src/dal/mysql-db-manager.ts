import { DBManager, MySQLQueryResult } from "./db-manager";
import mysql from 'mysql';
import dotenv from 'dotenv';

export class MySQLDBManager implements DBManager{

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

    async query(q: string) : Promise<MySQLQueryResult>{
        const conn = await this.connect();
        return new Promise((resolve, reject) => conn.query(q, (error, results, fields)=> {
            if(error){
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
}

let _dbManager : DBManager = null;

export function getDBManager(){
    dotenv.config()
    if(_dbManager === null) {
        _dbManager = new MySQLDBManager({
            host:'localhost',
            port : Number.parseInt(process.env.MYSQL_PORT),
            user     : process.env.MYSQL_USER,
            password : process.env.MYSQL_PASS
        })
    };
    return _dbManager;
}