
import { Entity } from "../entities/entity";
import { DBManager, MySQLQueryResult } from "./db-manager";


export interface IRepository{
    doesTableExist() : Promise<boolean>;
    // save(entity: Entity, cb: (err : any)=>void) : Promise<Entity>;
    // delete(entity: Entity, cb: (err:any)=>void) : Promise<Entity>;
    // find(criteria: Object) : Promise<Array<Entity>>;
    // findOneBy(criteria : Object) : Promise<Entity>;
}

export type SQLColumnDesc = {
    name : string;
    dataType : string;
    notNull? : boolean;
    default? : string;
    autoIncrement? : boolean;
    primaryKey? : boolean;
    foreignKey? : boolean;
}

export type SQLTableDesc = {
    schema : string;
    name : string;
}

export type SQLColumnMapping = {
    [varName : string] : SQLColumnDesc;
}

export abstract class Repository implements IRepository{
    _tableDesc : SQLTableDesc;
    _columnMappings : Record<string, SQLColumnDesc>;
    _dbManager: DBManager;
    _tableChecked : boolean = false;
    
    // abstract _getTableName() : string;

    /**
     *
     */
    constructor(tableDesc: SQLTableDesc, columnMapping : SQLColumnMapping, dbManager : DBManager) {
        this._tableDesc = tableDesc;
        this._columnMappings = columnMapping;
        this._dbManager = dbManager;
    }
    
    _getDBManager(): DBManager {
        return this._dbManager;
    }

    _getColumnMappings() : SQLColumnMapping {
        return this._columnMappings;
    }

    /**
     * Checks if table in db has been checked.
     * If not check whether it exists and that all the columns compatible.
     * If table doesn't exist, create it.
     * If table exist but incompatible, throw error.
     */
    async checkAndCreateTableIfNeeded() : Promise<void> {
        if(this._tableChecked) return;

        if(!(await this.doesTableExist())) {
            // create table if it doesn't exist
            await this.createTable();
        } else {
            // check columns approriate
            await this._checkTableCompatibility()
        }
        this._tableChecked = true;
        return;
    }

    /**
     * 
     * @returns true if table exists in DB
     */
    async doesTableExist() : Promise<boolean> {
        const query = `SELECT * FROM information_schema.tables WHERE table_schema = '${this._tableDesc.schema}' AND table_name = '${this._tableDesc.name}' LIMIT 1;`;
        const result : MySQLQueryResult  = await this._getDBManager().query(query);
        return (result.results !== null && result.results.length > 0);
    }

    /**
     * 
     * @param varName the variable name of the model/object
     * @returns the coresponding colulmn desc
     */
    getColumnDescForVarName(varName : string) : SQLColumnDesc {
        return this._getColumnMappings()[varName];
    }

    async _checkTableCompatibility() : Promise<any> {
        // TODO
        return;
        // throw Error(`table '${this._tableDesc.name}' in DB is incompatible with data type.`);
    }

    /**
     * Creates table in DB based on the ColumnMapping
     * @returns response for create table query
     */
    async createTable() : Promise<any> {
        const baseQuery = `CREATE TABLE IF NOT EXISTS \`${this._tableDesc.schema}\`.\`${this._tableDesc.name}\``;
        const columnDefinitions = Object.entries(this._getColumnMappings()).reduce<string>((acc : string, cur : [string, SQLColumnDesc]) : string=> {
            let curColumnDef = `${cur[1].name} ${cur[1].dataType}`;
            if (cur[1].notNull) curColumnDef += ' NOT NULL';
            if (cur[1].primaryKey) curColumnDef += ' PRIMARY KEY';
            if (cur[1].foreignKey) curColumnDef += ' FOREIGN KEY';
            if (cur[1].autoIncrement) curColumnDef += ' AUTO_INCREMENT';
            if (cur[1].default) curColumnDef += `DEFAULT ${cur[1].default}`;
            if (acc !== '') acc += ', ';
            return acc + curColumnDef;
        } , '');
        return this._getDBManager().query(baseQuery + '(' + columnDefinitions + ');');
    }

    async insert() : Promise<any> {
        // TODO
    }

    async update() : Promise<any> {
        // TODO
    }

    async save(entity: Entity, cb:(err: any)=>void) : Promise<Entity> {
        // TODO
        return null;
    }

    async purgeAllData() : Promise<any> {
        return this._getDBManager().query(`DROP TABLE IF EXISTS \`${this._tableDesc.schema}\`.\`${this._tableDesc.name}\``);
    }
}

