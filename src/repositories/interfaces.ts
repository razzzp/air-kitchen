import { IEntity, IOrder } from "../entities/interfaces";
import { LocalCredentials } from "../entities/typeorm-entities/local-credentials";

export interface IRepository {
    doesTableExist() : Promise<boolean>;
    save(entity: IEntity, options: any) : Promise<IEntity>;
    find(options?: any) : Promise<Array<IEntity>>;
    destroy() : void;
    // delete(entity: IEntity) : Promise<IEntity>;
    // findBy(criteria: Object) : Promise<Array<IEntity>>;
    // findOneBy(criteria : Object) : Promise<IEntity>;
}

/** @deprecated */
export interface IOrderRepository extends IRepository{
    /** @override */
    save(entity : IOrder) : Promise<IOrder>;
    /** @override */
    find() : Promise<Array<IOrder>>;
}