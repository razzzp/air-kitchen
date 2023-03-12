import Joi, { ObjectSchema } from "joi";
import { IOrder } from "../../entities/interfaces";
import { getIdValidator } from "./id-validator";
import { JoiValidator } from "./joi-validator";

export class OrderPartialValidator extends JoiValidator<IOrder>{
    /**
     *
     */
    constructor() {
        super();
        this._joiValidator =  Joi.object().keys({
            name: Joi.string().max(255),
            description: Joi.string().max(1000).allow(''),
            status: Joi.number().min(0).max(4),
            dueDate: Joi.date().iso(),
            salePrice: Joi.string().pattern(new RegExp("^(-|\\+)?[\\d]+$"))
        });
    }
}


export class OrderPostValidator extends OrderPartialValidator{

    /**
     *
     */
    constructor() {
        super();
        // modifies parent joi schema to require certain fields
        //  and inlcude default values]
        const base = this._joiValidator;
        this._joiValidator = (<ObjectSchema>base).keys({
            id: Joi.any().forbidden(),
            name: base.extract('name').required(),
            description: base.extract('description').default(""),
            status: base.extract('status').default(0),
            dueDate: base.extract('dueDate').default(null),
            salePrice: base.extract('salePrice').default('0')        
        });
    }
}

export class OrderPutValidator extends OrderPartialValidator{

    /**
     *
     */
    constructor() {
        super();
        // modifies parent joi schema to require certain fields
        //  and inlcude default values
        const base = this._joiValidator;
        this._joiValidator = (<ObjectSchema>base).keys({
            id: getIdValidator(),
            creator: Joi.any().forbidden(),
            creationDate: Joi.any().forbidden()
        });
    }
}