import { IValidator, TValidationResult } from "../ivalidator";
import joi from "joi"

export class UserValidator implements IValidator{
    private _joiOrderValidator : joi.Schema;

    public static getDisplayNameValidator() {
        // alphanumeric with spaces allowed except for leading and trailling spaces
        return joi.string().max(64).regex(/^\w+(?:\s+\w+)*\S$/);
    }
    /**
     *
     */
    constructor() {
        this._joiOrderValidator =  joi.object().keys({
            email: joi.string().max(64).required().email(),
            username: joi.string().max(64).required().alphanum(),
            displayName: UserValidator.getDisplayNameValidator()
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