import { type } from "os";
import { Column, Entity, LessThan, ManyToMany, ManyToOne } from "typeorm";
import { ILocalCredentials } from "../interfaces";
import { RootEntity } from "./root-entity";
import { User } from "./user";

@Entity()
export class LocalCredentials extends RootEntity implements ILocalCredentials{

    @ManyToOne(()=>User,{
        eager:true,
        nullable:false,
    })
    public user: User;

    @Column({
        type: "varbinary",
        length: 16,
        nullable:false,
    })
    public salt: Buffer;

    @Column({
        type: "varbinary",
        length: 32,
        nullable:false,
    })
    public hash: Buffer;


    /**
     *
     */
    constructor(data?: ILocalCredentials) {
        super();
        if(!data) return;
        this.user = data.user;
        this.salt = data.salt;
        this.hash = data.hash;
    }
}