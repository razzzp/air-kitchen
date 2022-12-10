import { PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { IEntity } from "../interfaces";

export abstract class RootEntity implements IEntity {
    @PrimaryGeneratedColumn()
    private _id: number;

    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }

    @CreateDateColumn()
    private _creationDate: Date;
    get creationDate() : Date {
        return this._creationDate;
    }
}