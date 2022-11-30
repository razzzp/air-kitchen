import { Entity } from "./entity";

export enum OrderStatus {
    Pending,
    InProgress,
    Done,
}

export class Order extends Entity {
    _name: string;
    _dueDate: number | null;
    _cost: number;
    _salePrice: number;
    _status:  OrderStatus;

    /**
     *
     */
    constructor(id:string, name:string, dueDate: number, cost: number, salePrice:number, status: OrderStatus) {
        super();
        this._name = name;
        this._dueDate = dueDate;
        this._cost = cost;
        this._salePrice = salePrice;
        this._status = status;
    }
}