import { Column, Entity } from "typeorm";
import { IUser } from "../interfaces";
import { RootEntity } from "./root-entity";

@Entity()
export class User extends RootEntity implements IUser {
    @Column()
    private _name : string
    
    get name(): string {
        return this._name;
    }
    set name(name: string) {
        this._name = name;
    }  
}