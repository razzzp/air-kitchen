import Express from "express";
import { Order } from "../entities/typeorm-entities/order";
import { getMySQLDataSource } from "../repositories/typeorm-repositories/data-sources";
import { OrderRepository } from "../repositories/typeorm-repositories/order-repository";
import { IValidator } from "../validators/ivalidator";
import { OrderValidator } from "../validators/joi/order-validator";


export class OrderController {
    protected static _getNewOrderValidator() : IValidator {
        return new OrderValidator();
    }

    /**
     * retrieves all orders
     * @param req express request object
     * @param res express response object
     * @param next express next function
     */
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

    /**
     * creates a new order from data provided in the request body
     * @param req 
     * @param res 
     * @param next 
     */
    public static async createOrder(req : Express.Request, res : Express.Response, next : Express.NextFunction) {
        // parse and validate body
        const requestBody = req.body;
        console.log(requestBody); 
        const orderValidator = OrderController._getNewOrderValidator();
        const validationResult = orderValidator.validate(requestBody);
       
        // const queryResults = orderRepo.save();
        if (!validationResult.error){
            const dataSource = getMySQLDataSource();
            const orderRepo = new OrderRepository(dataSource);
            const newOrder = new Order(validationResult.value);
            const savedOrder = await orderRepo.save(newOrder);
            res.json(savedOrder);
        } else {
            // throw new Error('something went wrong :(');
            // throw new Error(validationResult.error.annotate());
            next(validationResult.error);
        } 
    }
}
