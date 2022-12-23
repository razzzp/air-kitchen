import { BindOptions } from "dgram";
import { date } from "joi";
import { Column, Entity } from "typeorm";
import { IOrder } from "../interfaces";
import { RootEntity } from "./root-entity";

export enum EOrderStatus {
    Pending = 0,
    InProgress = 1,
    OnHold = 2,
    Done = 3,
    Cancelled = 4,
}

@Entity()
export class Order extends  RootEntity implements IOrder{

    /**
     *  initialization constructor, assumes the data is safe
     */
    constructor(data?:{
        name: string,
        desc: string,
        status: number,
        dueDate: Date,
        salePrice: string,
    }) {
        super();
        if (!data) return;

        this.name= data.name;
        this.description= data.desc;
        this.status= data.status;
        this.dueDate= data.dueDate;
        this.salePrice= BigInt(data.salePrice);
    }
    
    @Column({
        type : "varchar",
        length : 255
    })
    private _name: string;
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    @Column({
        type : "varchar",
        length : 1000,
        default: "",
    })
    private _description : string
    get description(): string {
        return this._description;
    }
    set description(description: string) {
        this._description = description;
    }

    @Column({
        type : "enum",
        enum : EOrderStatus,
        default : EOrderStatus.Pending
    })
    private _status : EOrderStatus;
    public get status() : EOrderStatus {
        return this._status;
    }
    public set status(status : EOrderStatus) {
        this._status = status;
    }

    @Column({
        type: "datetime",
        default: null,
    })
    private _dueDate : Date;
    get dueDate(): Date {
        return this._dueDate;
    }
    set dueDate(dueDate: Date) {
        this._dueDate = dueDate;
    }

    get totalCost(): number {
        throw new Error("Method not implemented.");
    }

    // stored as int to avoid rounding errors
    @Column({
        type : 'bigint',
        default: 0,
    })
    private _salePrice: bigint;
    public get salePrice(): bigint {
        return this._salePrice;
    }
    public set salePrice(salePrice: bigint) {
        this._salePrice = salePrice;
    }
}
