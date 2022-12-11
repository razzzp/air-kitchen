import Express from "express";
import { getMySQLDataSource } from "../repositories/data-sources";
import { OrderRepository } from "../repositories/typeorm-repositories/order-repository";


export class OrderController {
    public static async retrieveOrders(req : Express.Request, res : Express.Response, next : Express.NextFunction) {
        const dataSource = getMySQLDataSource();
        const orderRepo = new OrderRepository(dataSource);
        const queryResults = await orderRepo.find();
        const viewResults = queryResults.map((curOrder)=> {
            return {
                id : curOrder.id,
                creationDate : curOrder.creationDate.toString(),
                name : curOrder.name,
                description : curOrder.description,
                status : curOrder.status.toString(),
                salePrice : `\$${BigInt(curOrder.salePrice) / BigInt(100)}.${(BigInt(curOrder.salePrice) % BigInt(100)).toString().padStart(2,'0')} `,
                dueDate : curOrder.dueDate.toString()
            };
        });
        res.json(viewResults);
    }
}
