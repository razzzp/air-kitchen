import { IDBManager } from "../dbmanagers/idb-manager";
import { getDBManager } from "../dbmanagers/mysql-db-manager";
import { Repository, SQLTableDesc, SQLColumnDesc, SQLColumnMapping} from "../repositories/repository";
import { RootEntity } from "../entities/typeorm-entities/root-entity";
import { IEntity } from "../entities/interfaces";


class TestRepository extends Repository {
    /** @override */
    public save(entity : ITestEntity) : Promise<IEntity> {
        return super.save(entity);
    }
}

interface ITestEntity extends IEntity{
    testVar : string;
}

class TestEntity extends RootEntity implements ITestEntity {
    testVar : string;
}

function getNewTestRepo() : TestRepository {
    const dbManager = getDBManager();
    const columnDefinitions : SQLColumnMapping = {
        _id : {
            name : 'id',
            dataType : 'BIGINT UNSIGNED',
            notNull : true,
            primaryKey : true,
            autoIncrement : true,
        },
        _creationDate : {
            name : 'creation_date',
            dataType : 'VARCHAR(255)',
        },
        testVar : {
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
    let insertedEntity : ITestEntity;
    
    newEntity.testVar='test Value';
    insertedEntity =  (await tRepo.save(newEntity) as ITestEntity);
    
    console.log(insertedEntity);

    insertedEntity.testVar = 'modified values'
    insertedEntity = (await tRepo.save(insertedEntity) as ITestEntity);

    console.log(insertedEntity);

    tRepo.disconnect();
}

async function test() {
    await testRepoTableExists();
    await testRepoSave();
}

test()
.then((val) => {
    console.log('done');
})
.catch((val) => {
    console.log('error');
});
