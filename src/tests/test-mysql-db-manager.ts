import { assert } from "node:console";
import { getDBManager, MySQLDBManager } from "../dbmanagers/mysql-db-manager";

async function testConnect() {
    // const dbManager = new MySQLDBManager({
    //     host     : 'localhost',
        
    // });
    const dbManager = getDBManager();
    const connection = await dbManager.connect();
    assert(connection !== null || connection !== undefined, 'failed to connect');
    console.log('connected: ', connection);
    connection.end();
    console.log('connection closed.');
}

testConnect()
.then((val) => {
    console.log('done');
})
.catch((val) => {
    console.log('error');
});