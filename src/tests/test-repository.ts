import { DBManager } from "../dal/db-manager";
import { getDBManager } from "../dal/mysql-db-manager";
import { Repository, SQLTableDesc, SQLColumnDesc, SQLColumnMapping} from "../dal/repository";


export class TestRepository extends Repository {
    
}

async function testTableExists() {
    const dbManager = getDBManager();
    const columnDefinitions : SQLColumnMapping = {
        id : {
            name : 'id',
            dataType : 'INT UNSIGNED',
            notNull : true,
            primaryKey : true,
            autoIncrement : true,
        },
        testField : {
            name : 'testField',
            dataType : 'VARCHAR(255)',
        }
    };
    const tRepo = new TestRepository({schema: 'air-kitchen', name: 'test'}, columnDefinitions, dbManager);
    // console.log(await tRepo.purgeAllData());
    console.log(await tRepo.checkAndCreateTableIfNeeded());
    // assert((await tRepo.doesTableExist()) === false, 'does table exist check test failed.');
    getDBManager().disconnect();
}

testTableExists();