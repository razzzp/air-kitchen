import { Column, Entity, PrimaryColumn } from "typeorm";
import { IOrder } from "./ientity";

@Entity()
export class Order implements IOrder{
    
    @PrimaryColumn()
    private _id: number;
    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }

    @Column()
    private _creationDate: Date;
    public get creationDate(): Date {
        return this._creationDate;
    }

    @Column()
    private _name: string;
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
}