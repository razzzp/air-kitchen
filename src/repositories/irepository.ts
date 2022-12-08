import { IEntity } from "../entities/ientity";

export interface IRepository{
    doesTableExist() : Promise<boolean>;
    save(entity: IEntity, cb: (err : any)=>void) : Promise<IEntity>;
    delete(entity: IEntity, cb: (err:any)=>void) : Promise<IEntity>;
    findBy(criteria: Object) : Promise<Array<IEntity>>;
    findOneBy(criteria : Object) : Promise<IEntity>;
}