import { Column, Entity } from "typeorm";
import { IUser } from "../interfaces";
import { RootEntity } from "./root-entity";

@Entity()
export class User extends RootEntity implements IUser {
    /**
     *
     */
    constructor(data?: IUser) {
        super();
        if(!data) return;
        this.email = data.email;
        this.username = data.username;
    }

    @Column({
        type: "varchar",
        length: 254,
    })
    public email: string;

    @Column({
        type: "varchar",
        length: 64,
    })
    public username : string
}