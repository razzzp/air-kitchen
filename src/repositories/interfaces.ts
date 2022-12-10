import { IEntity, IOrder } from "../entities/interfaces";

export interface IRepository {
    doesTableExist() : Promise<boolean>;
    save(entity: IEntity) : Promise<IEntity>;
    destroy() : void;
    // delete(entity: IEntity) : Promise<IEntity>;
    // findBy(criteria: Object) : Promise<Array<IEntity>>;
    // findOneBy(criteria : Object) : Promise<IEntity>;
}

export interface IOrderRepository extends IRepository{
    /** @override */
    save(entity : IOrder) : Promise<IOrder>;
}