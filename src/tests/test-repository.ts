import { DBManager } from "../dal/db-manager";
import { getDBManager } from "../dal/mysql-db-manager";
import { Repository, SQLTableDesc, SQLColumnDesc, SQLColumnMapping} from "../dal/repository";
import { Entity } from "../entities/entity";


class TestRepository extends Repository {
    
}

class TestEntity extends Entity {
    _testVar : string;
}

function getNewTestRepo() : TestRepository {
    const dbManager = getDBManager();
    const columnDefinitions : SQLColumnMapping = {
        _id : {
            name : 'id',
            dataType : 'INT UNSIGNED',
            notNull : true,
            primaryKey : true,
            autoIncrement : true,
        },
        _creationDate : {
            name : 'creation_date',
            dataType : 'VARCHAR(255)',
        },
        _testVar : {
            name : 'test_field',
            dataType : 'VARCHAR(255)',
        }
    };
    const tRepo = new TestRepository({schema: 'air-kitchen', name: 'test'}, columnDefinitions, dbManager);
    return tRepo;
}


async function testRepoTableExists() {
    const tRepo = getNewTestRepo();
    console.log(await tRepo.purgeAllData());
    console.log(await tRepo.checkAndCreateTableIfNeeded());
    // assert((await tRepo.doesTableExist()) === false, 'does table exist check test failed.');
    tRepo.disconnect();
}

async function testRepoSave() {
    const tRepo = getNewTestRepo();
    const newEntity = new TestEntity();
    newEntity._testVar='test Value';

    console.log(await tRepo.save(newEntity));

    tRepo.disconnect();
}

async function test() {
    await testRepoTableExists();
    await testRepoSave();
}

test();
