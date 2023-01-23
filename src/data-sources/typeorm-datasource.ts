import { DataSource } from "typeorm";
import { Order } from "../entities/typeorm-entities/order";
import  dotenv  from "dotenv";
import { User } from "../entities/typeorm-entities/user";
import { LocalCredentials } from "../entities/typeorm-entities/local-credentials";
import { AccessTokenCredentials } from "../entities/typeorm-entities/bearer-token-credentials";
import { RefreshTokenCredentials } from "../entities/typeorm-entities/refresh-token-credentials";

let _dataSource : DataSource = null;

/**
 * Use only once initializeDataSource() has been called
 * @returns initialized data source
 */
export default function getMySQLDataSource() : DataSource {
    return _dataSource
}

function buildMySQLDataSource() : DataSource {
    dotenv.config();
    return new DataSource({
        type: "mysql",
        host: "localhost",
        port: Number.parseInt(process.env.MYSQL_PORT),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        synchronize: true,
        logging: false,
        entities: [Order, User, LocalCredentials, AccessTokenCredentials, RefreshTokenCredentials],
        subscribers: [],
        migrations: [],
        // dropSchema:true
    });
}

async function buildAndInitializeMySQLDataSource() : Promise<DataSource> {
    const newDataSource = buildMySQLDataSource();
    return newDataSource.initialize();
}

export async function initializeDataSource() : Promise<DataSource>{
    const dataSource =  buildAndInitializeMySQLDataSource();
    dataSource.then(value => {
        _dataSource = value;
    });
    return dataSource;
}