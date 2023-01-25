import { DataSource, EntityTarget, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository, SaveOptions } from "typeorm";
import { RootEntity } from "../../entities/typeorm-entities/root-entity";
import { IRepository } from "../interfaces";

export class TypeORMRepository<T extends RootEntity> implements IRepository<T>{
    private _dataSource : DataSource;
    get dataSource() : DataSource {
        return this._dataSource;
    }

    private _repo : Repository<T>;
    get repo() : Repository<T> {
        return this._repo;
    }
    /**
     *  Need to set the datasource to use
     */
    constructor(dataSource: DataSource, classType : EntityTarget<T>) {
        this._dataSource = dataSource;
        this._repo = dataSource.getRepository(classType);
    }

    async findBy(where?: FindOptionsWhere<T>): Promise<T[]> {
        return await this.repo.findBy(where);
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

    async findOneBy(where?: FindOptionsWhere<T>) : Promise<T> {
        return await this.repo.findOneBy(where);
    }

    async update(criteria: FindOptionsWhere<T>, partialEntity: any): Promise<any>{
        return await this.repo.update(criteria, partialEntity);
    }

    async delete(criteria?: FindOptionsWhere<T>): Promise<any> {
        return await this.repo.delete(criteria);
    }

    destroy(): void {
        // this.dataSource.destroy()    
    }
}