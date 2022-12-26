import { DataSource } from "typeorm";
import { Order } from "../../entities/typeorm-entities/order";
import  dotenv  from "dotenv";
import { User } from "../../entities/typeorm-entities/user";
import { LocalCredentials } from "../../entities/typeorm-entities/local-credentials";


let _dataSource : DataSource = null;

/**
 * Use only once initializeDataSource() has been called
 * @returns initialized data source
 */
export function getMySQLDataSource() : DataSource {
    return _dataSource
}

export function buildMySQLDataSource() : DataSource {
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
        entities: [Order, User, LocalCredentials],
        subscribers: [],
        migrations: [],
    });
}

export async function buildInitializedMySQLDataSource() : Promise<DataSource> {
    const newDataSource = buildMySQLDataSource();
    await newDataSource.initialize();
    return newDataSource;
}

export async function initializeDataSource() : Promise<DataSource>{
    _dataSource = await buildInitializedMySQLDataSource();
    return _dataSource;
}