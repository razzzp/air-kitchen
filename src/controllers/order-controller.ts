import Express from "express";
import { Order } from "../entities/typeorm-entities/order";
import { getOrderRepository } from "../repositories/typeorm-repositories/repositories";
import { IValidator } from "../validators/ivalidator";
import { OrderValidator } from "../validators/joi/order-validator";
import { IOrder, EOrderStatus, IUser } from "../entities/interfaces"
import { IsNull } from "typeorm";

export class OrderController {
    protected static _getNewValidator() : IValidator {
        return new OrderValidator();
    }

    protected static _priceToDisplay(priceString: bigint) {
        return `\$${BigInt(priceString) / BigInt(100)}.${(BigInt(priceString) % BigInt(100)).toString().padStart(2,'0')} `
    }

    protected static _instanceOfIOrder(object: any) : object is IOrder {
        let result ='name' in object ;
        result  &&= 'description' in object;
        result  &&= 'status' in object && object.status in EOrderStatus;
        result  &&= 'dueDate' in  object && (object.dueDate === null || object.dueDate instanceof Date);
        result  &&= 'salePrice' in object && typeof object.salePrice === 'string';
        return result;
    }

    protected static _buildOrderEntityFromData(data: IOrder) : IOrder {
        return new Order(data);
    }

    /**
     * retrieves all orders
     * @param req express request object
     * @param res express response object
     * @param next express next function
     */
    public static async retrieveOrders(req : Express.Request, res : Express.Response, next : Express.NextFunction) {
        const orderRepo = getOrderRepository();
        let queryOptions = null;
        // if user exist, search order for specific users only
        if (req.user && (<any>req.user).id) {
            queryOptions = {
                relations: {
                    creator: true
                },
                where:{
                    creator:{id: (<any>req.user).id}
                }
            }
        } else {
            queryOptions = {
                where:{
                    creator: IsNull()
                }
            }
        }
        const queryResults = await orderRepo.find(queryOptions);
        const viewResults = queryResults.map((curOrder)=> {
            if (!OrderController._instanceOfIOrder(curOrder)) return;
            return {
                id : curOrder.id,
                creationDate : curOrder.creationDate.toString(),
                name : curOrder.name,
                description : curOrder.description,
                status : curOrder.status.toString(),
                salePrice : (curOrder.salePrice) ? OrderController._priceToDisplay(curOrder.salePrice) : null,
                dueDate : (curOrder.dueDate) ? curOrder.dueDate.toString() : null,
                creator: (curOrder.creator)
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
        if(!req.user) return res.status(401).send('Unauthorized');
        // parse and validate body
        const requestBody = req.body;
        console.log(requestBody); 
        const orderValidator = OrderController._getNewValidator();
        const validationResult = orderValidator.validate(requestBody);
       
        // const queryResults = orderRepo.save();
        if (!validationResult.error){
            const validatedOrder = <IOrder>(validationResult.value);
            const orderRepo = getOrderRepository();
            const newOrder = OrderController._buildOrderEntityFromData(validatedOrder);
            newOrder.creator = <IUser>req.user;
            const savedOrder = await orderRepo.save(newOrder);
            return res.json(savedOrder);
        } else {
            // throw new Error('something went wrong :(');
            // throw new Error(validationResult.error.annotate());
            return next(validationResult.error);
        } 
    }
}
