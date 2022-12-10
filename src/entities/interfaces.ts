
export interface IEntity {
    set id(id: number);
    get id(): number;

    get creationDate() : Date;
}

export interface IOrder extends IEntity {
    get name() : string;
    set name(name : string);

    get description() : string;
    set description(description : string);

    get dueDate() : Date;
    set dueDate(dueDate : Date);

    get totalCost() : number;
}

export interface IUser extends IEntity {
    get name() : string;
    set name(name : string);
}