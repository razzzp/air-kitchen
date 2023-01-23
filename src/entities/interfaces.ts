
export interface IEntity {
    id?: number;
    creationDate?: Date;
}

export enum EOrderStatus {
    Pending = 0,
    InProgress = 1,
    OnHold = 2,
    Done = 3,
    Cancelled = 4,
}

export interface IOrder extends IEntity {
    name: string;
    description: string;
    status: EOrderStatus;
    dueDate: Date;  
    salePrice: bigint;
    creator: IUser;
}

export interface IUser extends IEntity {
    email: string;
    username: string;
    displayName?: string
}

export interface ILocalCredentials extends IEntity {
    user: IUser;
    salt: Buffer,
    hash: Buffer,
    expiryDate?: Date,
}

export interface IAccessTokenCredential extends IEntity {
    user: IUser,
    token: Buffer,
    refreshToken: IRefreshTokenCredential
    expiryDate: Date
}

export interface IRefreshTokenCredential extends IEntity {
    user: IUser,
    token: Buffer,
    expiryDate: Date
}