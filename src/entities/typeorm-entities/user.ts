import { Column, Entity } from "typeorm";
import { IUser } from "../interfaces";
import { RootEntity } from "./root-entity";

@Entity()
export class User extends RootEntity implements IUser {
    /**
     *
     */
    constructor(data: IUser) {
        super();
        this._email = data.email;
        this._name = data.name;
    }

    @Column({
        type: "varchar",
        length: 254,
    })
    private _email: string;
    public get email(): string {
        return this._email;
    }
    public set email(value: string) {
        this._email = value;
    }

    @Column({
        type: "varchar",
        length: 64,
    })
    private _name : string
    
    get name(): string {
        return this._name;
    }
    set name(name: string) {
        this._name = name;
    }  
}