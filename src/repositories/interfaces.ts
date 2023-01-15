import { IEntity, IOrder } from "../entities/interfaces";

export interface IRepository<T extends IEntity> {
    doesTableExist() : Promise<boolean>;
    save(entity: T, options?: any) : Promise<T>;
    find(options?: any) : Promise<Array<T>>;
    findOne(options?: any): Promise<T>;
    findOneBy(options?: any) : Promise<T>;
    delete(options?: any): Promise<any>
    destroy() : void;
    update(criteria: any, partialEntity: any) : Promise<any>;
    // delete(entity: IEntity) : Promise<IEntity>;
    // findBy(criteria: Object) : Promise<Array<IEntity>>;
    // findOneBy(criteria : Object) : Promise<IEntity>;
}

/** @deprecated */
export interface IOrderRepository extends IRepository<IOrder>{
    /** @override */
    save(entity : IOrder) : Promise<IOrder>;
    /** @override */
    find() : Promise<Array<IOrder>>;
}