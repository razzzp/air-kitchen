
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
}

export interface IUser extends IEntity {
    email: string;
    username: string;
}

export interface ILocalCredentials extends IEntity {
    user: IUser;
    salt: Buffer,
    hash: Buffer,
}