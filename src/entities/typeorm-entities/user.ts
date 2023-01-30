import { Column, Entity } from "typeorm";
import { EUserStatus, IUser } from "../interfaces";
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
        this.displayName = data.displayName;
    }

    @Column({
        type: "varchar",
        length: 254,
        nullable: false
    })
    public email: string;

    @Column({
        type: "varchar",
        length: 64,
        default: null
    })
    public username : string;

    @Column({
        type: "varchar",
        length: 64,
        default: null
    })
    public displayName? : string;

    @Column({
        type : "enum",
        enum : EUserStatus,
        default : EUserStatus.Active
    })
    public status: EUserStatus;
}