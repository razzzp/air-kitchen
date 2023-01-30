import { Column, Entity, ManyToOne } from "typeorm";
import { IFederatedCredentials, IUser } from "../interfaces";
import { RootEntity } from "./root-entity";
import { User } from "./user";

@Entity()
export default class FederatedCredentials extends RootEntity implements IFederatedCredentials {
    @ManyToOne((type)=>User,{
        eager:true,
        nullable:false
    })
    user: IUser;

    @Column({
        nullable:false
    })
    issuer: string;

    @Column({
        nullable:false
    })
    issuerUserId: string;

}