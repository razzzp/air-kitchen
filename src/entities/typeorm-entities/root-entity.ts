import { PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { IEntity } from "../interfaces";

export abstract class RootEntity implements IEntity {
    @PrimaryGeneratedColumn()
    public id?: number;

    @CreateDateColumn()
    public creationDate?: Date;
}