import { DBManager } from "../dal/db-manager";
import { getDBManager } from "../dal/mysql-db-manager";
import { Repository } from "../dal/repository";

export class TestRepository extends Repository {
    _getDBManager(): DBManager {
        return getDBManager();
    }
}