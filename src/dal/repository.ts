
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
    
    private _getDBManager(): DBManager {
        return this._dbManager;
    }

    private _getColumnMappings() : SQLColumnMapping {
        return this._columnMappings;
    }

    public getFullTableName() : string {
        return `\`${this._tableDesc.schema}\`.\`${this._tableDesc.name}\``;
    }

    /**
     * Checks if table in db has been checked.
     * If not check whether it exists and that all the columns compatible.
     * If table doesn't exist, create it.
     * If table exist but incompatible, throw error.
     */
    public async checkAndCreateTableIfNeeded() : Promise<void> {
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
    public async doesTableExist() : Promise<boolean> {
        const query = `SELECT * FROM information_schema.tables WHERE table_schema = '${this._tableDesc.schema}' AND table_name = '${this._tableDesc.name}' LIMIT 1;`;
        const result : MySQLQueryResult  = await this._getDBManager().query(query);
        return (result.results !== null && result.results.length > 0);
    }

    /**
     * 
     * @param varName the variable name of the model/object
     * @returns the coresponding colulmn desc
     */
    public getColumnDescForVarName(varName : string) : SQLColumnDesc {
        return this._getColumnMappings()[varName];
    }

    private async _checkTableCompatibility() : Promise<any> {
        // TODO
        return;
        // throw Error(`table '${this._tableDesc.name}' in DB is incompatible with data type.`);
    }

    /**
     * Creates table in DB based on the ColumnMapping
     * @returns response for create table query
     */
    public async createTable() : Promise<any> {
        const baseQuery = `CREATE TABLE IF NOT EXISTS ${this.getFullTableName()}`;
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

    /**
     * 
     */
    private _getColumnValues(entity: Entity) : Record<string, string>{
        let result : Record<string, string> = {};
        for(let keyValue of Object.entries(entity)){
            const curColumnDesc = this.getColumnDescForVarName(keyValue[0]);
            // id column (with null value) is included in query, but causes no problems
            result[curColumnDesc.name] = this._getDBManager().escapeValue(keyValue[1]);
        }
        return result;
    }

    private async _insertWithColumnValues(columnValues : Record<string, string>) : Promise<any> {
        const baseQuery = `INSERT INTO ${this.getFullTableName()} `;
        let columns = '';
        let values = '';
        // build columns and values list
        for(let entry of Object.entries(columnValues)){
            if (columns !== '') columns += ',';
            columns += entry[0];

            if (values !== '') values +=',';
            values += entry[1];
        }
        const finalQuery = baseQuery + '(' + columns + ') VALUES (' + values + ')';
        return await this._getDBManager().query(finalQuery);
    }

    private async _insertEntity(entity: Entity) : Promise<any> {
        const columnValues = this._getColumnValues(entity);
        return await this._insertWithColumnValues(columnValues);
    }

    private async _update(entity: Entity) : Promise<any> {
        // TODO
    }

    /**
     * If the entity has not been save, this method will perform an insert
     * else it will perform an update
     * @param entity object to save
     * @returns entity saved to DB, the id field will be field
     */
    public async save(entity: Entity) : Promise<Entity> {
        await this._getDBManager().connect();
        // no id means object has not been save before
        if(entity.id) return await this._update(entity);
        else return await this._insertEntity(entity);
    }

    public async purgeAllData() : Promise<any> {
        return await this._getDBManager().query(`DROP TABLE IF EXISTS ${this.getFullTableName()}`);
    }

    public async disconnect() {
        this._getDBManager().disconnect();
    }
}

