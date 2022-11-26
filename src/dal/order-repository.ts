import { DBManager } from "./db-manager";
import { Repository } from "./repository";

export class OrderRepository extends Repository {
    _getDBManager(): DBManager {
        throw new Error("Method not implemented.");
    }
    
}