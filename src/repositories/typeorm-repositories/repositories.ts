import { IOrderEntity } from "../../entities/interfaces";
import { LocalCredentials } from "../../entities/typeorm-entities/local-credentials";
import { Order } from "../../entities/typeorm-entities/order";
import { User } from "../../entities/typeorm-entities/user";
import { IRepository } from "../interfaces";
import getMySQLDataSource, { initializeDataSource } from "../../data-sources/typeorm-datasource";
import { TypeORMRepository } from "./typeorm-repository";
import { AccessTokenCredentials } from "../../entities/typeorm-entities/access-token-credentials";
import { RefreshTokenCredentials } from "../../entities/typeorm-entities/refresh-token-credentials";
import FederatedCredentials from "../../entities/typeorm-entities/federated-credentials";


export function getLocalCredentialsRepository() : TypeORMRepository<LocalCredentials> {
    const dataSource = getMySQLDataSource();
    return new TypeORMRepository(dataSource, LocalCredentials);
}

export function buildOrderRepository() : IRepository<IOrderEntity> {
    const dataSource = getMySQLDataSource();
    return new TypeORMRepository(dataSource, Order);
}

export function getUserRepository() : TypeORMRepository<User> {
    const dataSource = getMySQLDataSource();
    return new TypeORMRepository(dataSource, User);
}

export function getAccessTokenRepository() : TypeORMRepository<AccessTokenCredentials> {
    const dataSource = getMySQLDataSource();
    return new TypeORMRepository(dataSource, AccessTokenCredentials);
}

export function getRefreshTokenRepository() : TypeORMRepository<RefreshTokenCredentials> {
    const dataSource = getMySQLDataSource();
    return new TypeORMRepository(dataSource, RefreshTokenCredentials);
}

export function getFederatedCredentialsRepository() {
    const dataSource = getMySQLDataSource();
    return new TypeORMRepository(dataSource, FederatedCredentials);
}

