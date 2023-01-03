import { DataSource, FindManyOptions, FindOptionsWhere, Repository, SaveOptions } from "typeorm";
import { IEntity, IOrder } from "../../entities/interfaces";
import { Order } from "../../entities/typeorm-entities/order";
import { RootEntity } from "../../entities/typeorm-entities/root-entity";
import { IOrderRepository, IRepository } from "../interfaces";

export class TypeORMRepository<T extends RootEntity> implements IRepository{
    private _dataSource : DataSource;
    get dataSource() : DataSource {
        return this._dataSource;
    }

    private _repo : Repository<T>
    get repo() : Repository<T> {
        return this._repo;
    }
    /**
     *  Need to set the datasource to use
     */
    constructor(dataSource: DataSource, classType : any) {
        this._dataSource = dataSource;
        this._repo = dataSource.getRepository(classType);
    }


    doesTableExist(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async save(entity: T, options?: SaveOptions): Promise<T> {
        return await this.repo.save(entity, options);
    }
    
    async find(options?: FindManyOptions<T>) : Promise<Array<T>> {
        return await this.repo.find(options);
    }

    destroy(): void {
        // this.dataSource.destroy()    
    }
}