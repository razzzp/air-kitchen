import { IOrder } from "../../entities/interfaces";
import { LocalCredentials } from "../../entities/typeorm-entities/local-credentials";
import { Order } from "../../entities/typeorm-entities/order";
import { User } from "../../entities/typeorm-entities/user";
import { IRepository } from "../interfaces";
import { getMySQLDataSource } from "./data-sources";
import { TypeORMRepository } from "./typeorm-repository";

export function getLocalCredentialsRepository() : TypeORMRepository<LocalCredentials> {
    const dataSource = getMySQLDataSource();
    return new TypeORMRepository(dataSource, LocalCredentials);
}

export function getOrderRepository() : IRepository<IOrder> {
    const dataSource = getMySQLDataSource();
    return new TypeORMRepository(dataSource, Order);
}

export function getUserRepository() : TypeORMRepository<User> {
    const dataSource = getMySQLDataSource();
    return new TypeORMRepository(dataSource, User);
}

