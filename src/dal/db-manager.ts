import mysql from 'mysql'
import dotenv from 'dotenv'

export interface DBManager {
    connect() : Promise<mysql.Connection>;
}

export class MySQLDBManager {

    _connectionConfig : mysql.ConnectionConfig;
    _connection : mysql.Connection | null = null;

    constructor(connectionConfig : mysql.ConnectionConfig){
        this._connectionConfig = connectionConfig;
    }

    async connect() : Promise<mysql.Connection> {
        this._connection = mysql.createConnection(this._connectionConfig);
        await this._connection.connect();
        return this._connection;
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