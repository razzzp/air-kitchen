
export interface IEntity {
    id: number;
    creationDate: Date;
}

export interface IOrder extends IEntity{
    name: string;
}