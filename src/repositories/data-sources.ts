import { DataSource } from "typeorm";
import { Order } from "../entities/typeorm-entities/order";
import  dotenv  from "dotenv";
import { User } from "../entities/typeorm-entities/user";

dotenv.config();
const _dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: Number.parseInt(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    synchronize: true,
    logging: false,
    entities: [Order, User],
    subscribers: [],
    migrations: [],
});

export function getMySQLDataSource() : DataSource {
    return _dataSource
} 