import { DataSource, Repository } from "typeorm";
import { IOrder } from "../../entities/interfaces";
import { Order } from "../../entities/typeorm-entities/order";
import { IOrderRepository } from "../interfaces";

export class OrderRepository implements IOrderRepository {

    private _dataSource : DataSource;
    get dataSource() : DataSource {
        return this._dataSource;
    }

    private _repo : Repository<Order>
    get repo() : Repository<Order> {
        return this._repo;
    }
    /**
     *  Need to set the datasource to use
     */
    constructor(dataSource : DataSource) {
        this._dataSource = dataSource;
        this._repo = dataSource.getRepository(Order);
    }


    doesTableExist(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async save(entity: IOrder): Promise<IOrder> {
        return await this.repo.save(entity);
    }
    
    async find() {
        return await this.repo.find();
    }

    destroy(): void {
        // this.dataSource.destroy()    
    }
}