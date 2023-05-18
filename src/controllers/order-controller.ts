import Express from "express";
import { Order } from "../entities/typeorm-entities/order";
import { IValidator } from "../validators/ivalidator";
import { OrderPostValidator, OrderPutValidator } from "../validators/joi/order-validator";
import { IOrder, EOrderStatus, IUser } from "../entities/interfaces";
import { IsNull } from "typeorm";
import { isValidId } from "../validators/joi/id-validator";
import { IViewBuilder } from "../views/view-builder";
import { IRepository } from "../repositories/interfaces";

export class OrderController {
    private _orderViewBuilder : IViewBuilder<IOrder>;
    private _orderRepo : IRepository<IOrder>;
    /**
     *
     */
    constructor(orderViewBuilder : IViewBuilder<IOrder>, orderRepo : IRepository<IOrder>) {
        this._orderViewBuilder = orderViewBuilder;
        this._orderRepo = orderRepo;
    }

    protected static _getNewPostValidator() : IValidator<IOrder> {
        return new OrderPostValidator();
    }

    protected static _getNewPutValidator() : IValidator<IOrder> {
        return new OrderPutValidator();
    }

    protected static _isInstanceOfIOrder(object: any) : object is IOrder {
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
     * Middleware to retrieve order based on OrderID
     *  sets in in the req object
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public async getAndSetOrder(req : Express.Request, res : Express.Response, next : Express.NextFunction) { 
        // validate order id in uri
        const { orderId } = req.params;
        if (!isValidId(orderId)) return res.status(400).send('Invalid Order Id');

        // retrieve order from db
        const orderRepo = this._orderRepo;
        // load creator field
        const retrievedOrder = await orderRepo.findOne({
            relations: {creator: true},
            where: {id: orderId}
        });
        if (!retrievedOrder) return res.status(404).send('Order doesn\'t exist');

        // set order entity in request object
        req.orderEntity = retrievedOrder;
        next();
    }

    /**
     * Checks whether user is authorized to modify the retrieved order in the req object
     * Prereqs:
     * - Order entity in req object
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public async authorizeUserForOrder(req : Express.Request, res : Express.Response, next : Express.NextFunction) {
        if (!req.user) return res.status(401).send('Unauthorized');
        if (!req.orderEntity || !req.orderEntity.creator) return res.status(500).send('Something went wrong');
        const retrievedOrder = req.orderEntity;

        // if current user is not the creator, unauthorized
        if(req.user.id !== retrievedOrder.creator.id) return res.status(401).send('Unauthorized');
        next();
    }

    /**
     * Retrieves all orders
     * If user is logged in returns orders with them as the creator
     * Else returns orders with no creators assigned
     * @param req express request object
     * @param res express response object
     * @param next express next function
     */
    public async retrieveOrders(req : Express.Request, res : Express.Response, next : Express.NextFunction) {
        const orderRepo = this._orderRepo;
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
            };
        } else {
            queryOptions = {
                where:{
                    creator: IsNull()
                }
            };
        }
        const queryResults = await orderRepo.find(queryOptions);
        const viewResults = queryResults.map((curOrder)=> {
            if (!OrderController._isInstanceOfIOrder(curOrder)) return;
            return this._orderViewBuilder.buildView(curOrder);
        });
        return res.json(viewResults);
    }

    /**
     * Creates a new order from data provided in the request body
     * @param req 
     * @param res 
     * @param next 
     */
    public async createOrder(req : Express.Request, res : Express.Response, next : Express.NextFunction) {
        if(!req.user) return res.status(401).send('Unauthorized');
        // parse and validate body
        const requestBody = req.body;
        // console.log(requestBody); 
        const orderValidator = OrderController._getNewPostValidator();
        const validationResult = orderValidator.validate(requestBody);
       
        // const queryResults = orderRepo.save();
        if (!validationResult.error){
            const validatedOrder = <IOrder>(validationResult.value);
            const orderRepo = this._orderRepo;
            const newOrder = OrderController._buildOrderEntityFromData(validatedOrder);
            newOrder.creator = <IUser>req.user;
            const savedOrder = await orderRepo.save(newOrder);
            return res.status(200).json(savedOrder);
        } else {
            // throw new Error('something went wrong :(');
            // throw new Error(validationResult.error.annotate());
            res.status(400);
            return next(validationResult.error);
        } 
    }

    /**
     *  Prereqs:
     * - Order entity should be present in req
     * - User should be authorized
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public async retrieveOrder(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        if (!req.user) return res.status(401).send('Unauthorized');
        if (!req.orderEntity) return res.status(500).send('Something went wrong');
   
        const retrievedOrder = req.orderEntity;

        return res.json(this._orderViewBuilder.buildView(retrievedOrder));
    }

    /**
     * Prereqs:
     * - Order entity should be present in req
     * - User should be authorized
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public async updateOrder(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        if (!req.user) return res.status(401).send('Unauthorized');
        if (!req.orderEntity) return res.status(500).send('Something went wrong');

        const retrievedOrder = req.orderEntity;
        // parse & validate body
        const orderValidator = OrderController._getNewPutValidator();
        const requestBody = req.body;
        // set id to id in params
        requestBody.id = retrievedOrder.id;
        const validationResult = orderValidator.validate(requestBody);
       
        // const queryResults = orderRepo.save();
        if (!validationResult.error){
            const validatedOrder = <IOrder>(validationResult.value);
            // save order
            const orderRepo = this._orderRepo;
            const savedOrder = await orderRepo.save(validatedOrder);
            return res.json(savedOrder);
        } else {
            // throw new Error('something went wrong :(');
            // throw new Error(validationResult.error.annotate());
            return next(validationResult.error);
        }
    }

    /**
     * Prereqs:
     * - Order entity should be present in req
     * - User should be authorized
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public async deleteOrder(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        if (!req.user) return res.status(401).send('Unauthorized');
        if (!req.orderEntity) return res.status(500).send('Something went wrong');

        const retrievedOrder = req.orderEntity;
        const orderRepo = this._orderRepo;
        const result = await orderRepo.delete({id: retrievedOrder.id});
        return res.send(result);
    }
}
