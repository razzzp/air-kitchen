import { type } from "os";
import { Column, Entity, LessThan, ManyToMany, ManyToOne } from "typeorm";
import { ILocalCredentials } from "../interfaces";
import { RootEntity } from "./root-entity";
import { User } from "./user";

@Entity()
export class LocalCredentials extends RootEntity implements ILocalCredentials{

    @ManyToOne(()=>User)
    private _user: User;
    public get user(): User {
        return this._user;
    }
    public set userId(value: User) {
        this._user = value;
    }

    @Column({
        type: "varbinary",
        length: 16
    })
    private _salt: Buffer;
    public get salt(): Buffer {
        return Buffer.from(this._salt);
    }
    public set salt(value: Buffer) {
        this._salt = value;
    }

    @Column({
        type: "varbinary",
        length: 32
    })
    private _hash: Buffer;
    public get hash(): Buffer {
        return Buffer.from(this._hash);
    }
    public set hash(value: Buffer) {
        this._hash = value;
    }

    @Column({
        type: "datetime",
        default: null
    })
    private _expiryDate: Date;
    public get expiryDate(): Date {
        return this._expiryDate;
    }
    public set expiryDate(value: Date) {
        this._expiryDate = value;
    }
}