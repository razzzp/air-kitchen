import { IValidator, TValidationResult } from "../ivalidator";
import joi from "joi"

export class UserValidator implements IValidator{
    private _joiOrderValidator : joi.Schema;

    /**
     *
     */
    constructor() {
        this._joiOrderValidator =  joi.object().keys({
            email: joi.string().max(64).required().email(),
            name: joi.string().max(64).required().alphanum(),
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