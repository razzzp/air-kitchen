import Express, { query } from "express";
import { Order } from "../entities/typeorm-entities/order";
import { IOrder, IValidator } from "../validators/interfaces";
import { OrderPartialValidator, OrderPostValidator, OrderPutValidator } from "../validators/joi/order-validator";
import { IOrderEntity, EOrderStatus, IUser } from "../entities/interfaces";
import { IsNull, Like } from "typeorm";
import { isValidId } from "../validators/joi/id-validator";
import { IViewBuilder } from "../views/view-builder";
import { IRepository } from "../repositories/interfaces";
import { OrderStatusUtil } from "../entities/utils";
import { any } from "joi";

export class OrderController {
    private _orderViewBuilder : IViewBuilder<IOrderEntity>;
    private _orderRepo : IRepository<IOrderEntity>;
    /**
     *
     */
    constructor(orderViewBuilder : IViewBuilder<IOrderEntity>, orderRepo : IRepository<IOrderEntity>) {
        this._orderViewBuilder = orderViewBuilder;
        this._orderRepo = orderRepo;
    }

    protected static _getNewPostValidator() : IValidator<IOrder> {
        return new OrderPostValidator();
    }

    protected static _getNewPutValidator() : IValidator<IOrder> {
        return new OrderPutValidator();
    }

    protected static _isInstanceOfIOrder(object: any) : object is IOrderEntity {
        let result ='name' in object ;
        result  &&= 'description' in object;
        result  &&= 'status' in object && object.status in EOrderStatus;
        result  &&= 'dueDate' in  object && (object.dueDate === null || object.dueDate instanceof Date);
        result  &&= 'salePrice' in object && typeof object.salePrice === 'string';
        return result;
    }

    protected static _buildOrderEntityFromOrderData(data: IOrder) : IOrderEntity {
        const result = new Order();
        
        result.id = data.id? data.id :undefined;
        result.name= data.name;
        result.description= data.description;
        result.status= OrderStatusUtil.parse(data.status);
        result.dueDate= data.dueDate;
        result.salePrice= data.salePrice;
        return result;
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

    private _parseEntityPartial(dict : {[key:string]: unknown}) : Partial<IOrderEntity> | undefined {
        // TODO: implemt rest of fields
        // TODO: move to utils?
        if(!dict) return undefined;
        const result : Partial<IOrderEntity>= {};
        if(dict.id && typeof dict.id === 'string') result.id = Number.parseInt(dict.id);
        if(dict.name && typeof dict.name === 'string') result.name = dict.name;
        if(dict.status && typeof dict.status === 'string') result.status = OrderStatusUtil.parse(dict.status);
        return result;
    }

    private _buildQueryOptions(query: {[key :string] : unknown}, user: IUser) : any{
        // TODO: implement other fields
        const orderPartial = this._parseEntityPartial(query);
        if (!orderPartial) return undefined;


        let queryOptions = null;
        // if user exist, search order for specific users only
        queryOptions = {
            relations: {
                creator: true
            },
            where:{
                id: orderPartial.id,
                // dunno why i need to do this...
                //  mysql table is enum('0','1',...)
                //  if we query using number, it will assume the index of the enum, 1='0', 2='1'...
                //   why is this not documented in typeorm...?
                //  so convert to string instead, seems to work :|
                status: orderPartial.status ?  `${orderPartial.status}` : undefined,
                name: orderPartial.name ? Like(`%${orderPartial.name}%`) : undefined,
                creator:{id: user.id},
            }
        };

        return queryOptions;
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
        if(!req.user) return res.status(401).send('Unauthorized');
        const orderRepo = this._orderRepo;

        const validationResult = new OrderPartialValidator().validate(req.query);
        if (validationResult.error) return res.status(400).send(`Bad request. ${validationResult.error}`);
        // if user exist, search order for specific users only
        const queryOptions = this._buildQueryOptions(req.query, req.user);

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
            const newOrder = OrderController._buildOrderEntityFromOrderData(validatedOrder);
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
            const updatedOrder = OrderController._buildOrderEntityFromOrderData(validatedOrder);
            // save order
            const orderRepo = this._orderRepo;
            
            const savedOrder = await orderRepo.save(updatedOrder);
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
