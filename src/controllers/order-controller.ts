import Express from "express";
import { Order } from "../entities/typeorm-entities/order";
import { getOrderRepository } from "../repositories/typeorm-repositories/repositories";
import { IValidator } from "../validators/ivalidator";
import { OrderValidator } from "../validators/joi/order-validator";


export class OrderController {
    protected static _getNewValidator() : IValidator {
        return new OrderValidator();
    }

    protected static _priceToDisplay(priceString: bigint) {
        return `\$${BigInt(priceString) / BigInt(100)}.${(BigInt(priceString) % BigInt(100)).toString().padStart(2,'0')} `
    }

    /**
     * retrieves all orders
     * @param req express request object
     * @param res express response object
     * @param next express next function
     */
    public static async retrieveOrders(req : Express.Request, res : Express.Response, next : Express.NextFunction) {
        const orderRepo = getOrderRepository();
        const queryResults = await orderRepo.find();
        const viewResults = queryResults.map((curOrder)=> {
            return {
                id : curOrder.id,
                creationDate : curOrder.creationDate.toString(),
                name : curOrder.name,
                description : curOrder.description,
                status : curOrder.status.toString(),
                salePrice : (curOrder.salePrice) ? OrderController._priceToDisplay(curOrder.salePrice) : null,
                dueDate : (curOrder.dueDate) ? curOrder.dueDate.toString() : null,
            };
        });
        return res.json(viewResults);
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
        const orderValidator = OrderController._getNewValidator();
        const validationResult = orderValidator.validate(requestBody);
       
        // const queryResults = orderRepo.save();
        if (!validationResult.error){
            const orderRepo = getOrderRepository();
            const newOrder = new Order(validationResult.value);
            const savedOrder = await orderRepo.save(newOrder);
            return res.json(savedOrder);
        } else {
            // throw new Error('something went wrong :(');
            // throw new Error(validationResult.error.annotate());
            return next(validationResult.error);
        } 
    }
}
