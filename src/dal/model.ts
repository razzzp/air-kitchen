import { Entity } from "../entities/entity";


export interface IRepository{
    
}

abstract class Repository implements IRepository{
    abstract _getColumnNameForVar(varName : string) : string;
    abstract _getTableName() : string;
    
    abstract save(entity: Entity, cb: (err : any)=>void) : void;
    abstract delete(entity: Entity, cb: (err:any)=>void) : Entity;
    abstract find(criteria: Object) : Array<Entity>;
    abstract findOneBy(criteria : Object) : Entity;
}