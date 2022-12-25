
export interface IEntity {
    set id(id: number);
    get id(): number;

    get creationDate() : Date;
}

export enum EOrderStatus {
    Pending = 0,
    InProgress = 1,
    OnHold = 2,
    Done = 3,
    Cancelled = 4,
}

export interface IOrder extends IEntity {
    get name() : string;
    set name(name : string);

    get description() : string;
    set description(description : string);

    get status() : EOrderStatus;
    set status(status : EOrderStatus);

    get dueDate() : Date;
    set dueDate(dueDate : Date);

    get totalCost() : number;

    get salePrice() : bigint;
    set salePrice(salePrice: bigint);
}

export interface IUser extends IEntity {
    get email() : string;
    set email(email : string);

    get name() : string;
    set name(name : string);
}

export interface ILocalCredentials extends IEntity {
    get salt() : Buffer;
    set salt(salt : Buffer);

    get hash() : Buffer;
    set hash(hash: Buffer);
}