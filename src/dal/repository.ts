import { Entity } from "../entities/entity";
import { DBManager, MySQLQueryResult } from "./db-manager";


export interface IRepository{
    doesTableExist() : Promise<boolean>;
    // save(entity: Entity, cb: (err : any)=>void) : Promise<Entity>;
    // delete(entity: Entity, cb: (err:any)=>void) : Promise<Entity>;
    // find(criteria: Object) : Promise<Array<Entity>>;
    // findOneBy(criteria : Object) : Promise<Entity>;
}

export abstract class Repository implements IRepository{
    _tableSchema : string;
    _tableName : string;

    abstract _getDBManager() : DBManager;
    // abstract _getColumnNameForVar(varName : string) : string;
    // abstract _getTableName() : string;
    // abstract _getColumnMapping() : Record<string, string>;

    /**
     *
     */
    constructor(tableSchema: string, tableName : string) {
        this._tableSchema = tableSchema;
        this._tableName = tableName;
    }
    
    async doesTableExist() : Promise<boolean> {
        const query = `SELECT * FROM information_schema.tables WHERE table_schema = '${this._tableSchema}' AND table_name = '${this._tableName}' LIMIT 1;`;
        const result : MySQLQueryResult  = await this._getDBManager().query(query);
        return (result.results !== null && result.results.length > 0);
    }

    save(entity: Entity, cb:(err: any)=>void) : void {

    }
}

