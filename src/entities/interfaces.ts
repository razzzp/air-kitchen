
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

export enum EUserStatus {
    Active = 0,
    Inactive = 1,
}

export interface IOrderEntity extends IEntity {
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
    displayName?: string;
    status: EUserStatus;
}


export interface ILocalCredentials extends IEntity {
    user: IUser;
    salt: Buffer;
    hash: Buffer;
    expiryDate?: Date;
}

export interface ITokenCredential extends IEntity {
    user: IUser;
    token: Buffer;
    expiryDate: Date;
}

export interface IAccessTokenCredential extends ITokenCredential {
    refreshToken: IRefreshTokenCredential;
}

export interface IRefreshTokenCredential extends ITokenCredential {
}

export interface IFederatedCredentials extends IEntity {
    user: IUser;
    issuer: string;
    issuerUserId: string;
}

