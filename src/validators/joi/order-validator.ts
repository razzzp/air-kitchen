import Joi from "joi";
import { IValidator, TValidationResult } from "../ivalidator";
import { getIdValidator } from "./id-validator";

export class OrderPartialValidator implements IValidator{
    protected _joiOrderValidator : Joi.ObjectSchema;

    /**
     *
     */
    constructor() {
        this._joiOrderValidator =  Joi.object().keys({
            name: Joi.string().max(255),
            description: Joi.string().max(1000),
            status: Joi.number().min(0).max(4),
            dueDate: Joi.date().iso(),
            salePrice: Joi.string().pattern(new RegExp("^(-|\\+)?[\\d]+$"))
        });
    }

    public validate(data: any): TValidationResult {
        const joiResult = this._joiOrderValidator.validate(data);
        const result = {
            error: joiResult.error,
            warning: joiResult.warning,
            value: joiResult.value,
        }
        return result;
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
        const base = this._joiOrderValidator;
        this._joiOrderValidator = base.keys({
            id: Joi.any().forbidden(),
            name: base.extract('name').required(),
            description: base.extract('description').default(""),
            status: base.extract('status').default(0),
            dueDate: base.extract('dueDate').default(null),
            salePrice: base.extract('salePrice').default('0')        
        })
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
        this._joiOrderValidator = this._joiOrderValidator.keys({
            id: getIdValidator(),
            creator: Joi.any().forbidden(),
            creationDate: Joi.any().forbidden()
        })
    }
}