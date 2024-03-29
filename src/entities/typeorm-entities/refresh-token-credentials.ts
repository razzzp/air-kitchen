import { Column, Entity, Index, ManyToOne } from "typeorm";
import { IRefreshTokenCredential } from "../interfaces";
import { RootEntity } from "./root-entity";
import { User } from "./user";

@Entity()
export class RefreshTokenCredentials extends RootEntity implements IRefreshTokenCredential {
    @ManyToOne(()=>User,{
        eager:true,
        nullable:false,
    })
    public user: User;

    @Index({unique: true})
    @Column({
        type: "varbinary",
        length: 32,
        nullable:false,
    })
    public token: Buffer;

    @Column({
        type: "datetime",
        nullable: false
    })
    public expiryDate: Date;

    constructor(data? : IRefreshTokenCredential){
        super();
        if(!data) return;

        this.user = data.user;
        this.token = data.token;
        this.expiryDate = data.expiryDate;
    }
}