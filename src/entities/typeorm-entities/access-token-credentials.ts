import { Column, Entity, Index, ManyToOne } from "typeorm";
import { IAccessTokenCredential } from "../interfaces";
import { RefreshTokenCredentials } from "./refresh-token-credentials";
import { RootEntity } from "./root-entity";
import { User } from "./user";

@Entity()
export class AccessTokenCredentials extends RootEntity implements IAccessTokenCredential {
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

    @ManyToOne(()=>RefreshTokenCredentials)
    public refreshToken: RefreshTokenCredentials;

    @Column({
        type: "datetime",
        nullable: false,
    })
    public expiryDate: Date;

    constructor(data? : IAccessTokenCredential){
        super();
        if(!data) return;

        this.user = data.user;
        this.token = data.token;
        this.refreshToken = data.refreshToken;
        this.expiryDate = data.expiryDate;
    }
}