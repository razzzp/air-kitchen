import { assert } from "console";
import { getDBManager } from "../dal/mysql-db-manager";
import { TestRepository } from "./test-repo";

async function testTableExists() {
    const tRepo = new TestRepository('air-kitchen', 'test');
    console.log(await tRepo.doesTableExist());
    // assert((await tRepo.doesTableExist()) === false, 'does table exist check test failed.');
    getDBManager().disconnect();
}

testTableExists();