import { IEntity, IOrderEntity } from "../entities/interfaces";

export interface IRepository<T extends IEntity> {
    doesTableExist() : Promise<boolean>;
    save(entity: T, options?: any) : Promise<T>;
    find(options?: any) : Promise<Array<T>>;
    findBy(where? : any) : Promise<Array<T>>;
    findOne(options?: any): Promise<T>;
    findOneBy(where?: any) : Promise<T>;
    delete(criteria?: any): Promise<any>
    destroy() : void;
    update(criteria: any, partialEntity: any) : Promise<any>;
    // delete(entity: IEntity) : Promise<IEntity>;
    // findBy(criteria: Object) : Promise<Array<IEntity>>;
    // findOneBy(criteria : Object) : Promise<IEntity>;
}

/** @deprecated */
export interface IOrderRepository extends IRepository<IOrderEntity>{
    /** @override */
    save(entity : IOrderEntity) : Promise<IOrderEntity>;
    /** @override */
    find() : Promise<Array<IOrderEntity>>;
}