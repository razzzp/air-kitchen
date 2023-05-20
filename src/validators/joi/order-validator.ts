import Joi from "joi";
import { IOrderEntity } from "../../entities/interfaces";
import { getIdValidator } from "./id-validator";
import { JoiValidator } from "./joi-validator";
import { IOrder } from "../interfaces";

function nameValidator(){
    return Joi.string().max(255);
}
function descriptionValidator(){
    return Joi.string().max(1000).allow('');
}
function statusValidator(){
    return Joi.string();
}
function dueDateValidator(){
    return Joi.date().iso();
}
function salePriceValidator(){
    return Joi.string().pattern(new RegExp("^(-|\\+)?[\\d]+$"));
}

export class OrderPostValidator extends JoiValidator<IOrder>{

    /**
     *
     */
    constructor() {
        super();
        // modifies parent Joi schema to require certain fields
        //  and inlcude default values]
        this._joiValidator = Joi.object().keys({
            id: Joi.any().forbidden(),
            name: nameValidator().required(),
            description: descriptionValidator().default(""),
            status: statusValidator().default(0),
            dueDate: dueDateValidator().default(null),
            salePrice: salePriceValidator().default('0')        
        });
    }
}

export class OrderPutValidator extends JoiValidator<IOrder>{

    /**
     *
     */
    constructor() {
        super();
        // modifies parent joi schema to require certain fields
        //  and inlcude default values
        this._joiValidator = Joi.object().keys({
            id: getIdValidator(),
            name: nameValidator().required(),
            description: descriptionValidator().default(""),
            status: statusValidator().default(0),
            dueDate: dueDateValidator().default(null),
            salePrice: salePriceValidator().default('0')        
        });
    }
}