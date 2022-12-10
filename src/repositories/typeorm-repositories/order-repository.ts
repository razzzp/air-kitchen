import { DataSource } from "typeorm";
import { IEntity, IOrder } from "../../entities/interfaces";
import { Order } from "../../entities/typeorm-entities/order";
import { IOrderRepository } from "../interfaces";

export class OrderRepository implements IOrderRepository {

    _dataSource : DataSource;
    get dataSource() : DataSource {
        return this._dataSource;
    }
    /**
     *  Need to set the datasource to use
     */
    constructor(dataSource : DataSource) {
        this._dataSource = dataSource;
    }


    doesTableExist(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async save(entity: IOrder): Promise<IOrder> {
        const orderRepo = this._dataSource.getRepository(Order);
        return await orderRepo.save(entity);
    }

    destroy(): void {
        this._dataSource.destroy()    
    }
}