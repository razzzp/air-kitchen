import { DataSource } from "typeorm";
import { Order } from "../entities/order";
import  dotenv  from "dotenv";

export function getMySQLDataSource() : DataSource{
    dotenv.config();
    return new DataSource({
        type: "mysql",
        host: "localhost",
        port: Number.parseInt(process.env.MYSQL_PORT),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        synchronize: true,
        logging: true,
        entities: [Order],
        subscribers: [],
        migrations: [],
    });
} 