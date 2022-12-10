import { Column, Entity } from "typeorm";
import { IOrder } from "../interfaces";
import { RootEntity } from "./root-entity";

@Entity()
export class Order extends  RootEntity implements IOrder{
    
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
        length : 1000
    })
    private _description : string
    get description(): string {
        return this._description;
    }
    set description(description: string) {
        this._description = description;
    }

    @Column()
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
}