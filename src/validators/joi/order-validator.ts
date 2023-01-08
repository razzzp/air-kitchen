import joi from "joi";
import { IValidator, TValidationResult } from "../ivalidator";

export class OrderValidator implements IValidator{
    private _joiOrderValidator : joi.Schema;

    /**
     *
     */
    constructor() {
        this._joiOrderValidator =  joi.object().keys({
            name: joi.string().max(255).required(),
            description: joi.string().max(1000).default(""),
            status: joi.number().min(0).max(4).default(0),
            dueDate: joi.date().iso().default(null),
            salePrice: joi.string().pattern(new RegExp("^(-|\\+)?[\\d]+$")).default('0')
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