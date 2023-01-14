import { DataSource, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository, SaveOptions } from "typeorm";
import { RootEntity } from "../../entities/typeorm-entities/root-entity";
import { IOrderRepository, IRepository } from "../interfaces";

export class TypeORMRepository<T extends RootEntity> implements IRepository<T>{
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

    async findOne(options?: FindOneOptions<T>) : Promise<T> {
        return await this.repo.findOne(options);
    }

    async findOneBy(options?: FindOptionsWhere<T>) : Promise<T> {
        return await this.repo.findOneBy(options);
    }



    destroy(): void {
        // this.dataSource.destroy()    
    }
}