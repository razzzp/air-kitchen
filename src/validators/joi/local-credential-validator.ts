import { IValidator, TValidationResult } from "../ivalidator";
import joi from "joi";

export class LocalCredentialsValidator implements IValidator{
    private _joiLocalCredentialsValidator : joi.Schema;

    /**
     *
     */
    constructor() {
        this._joiLocalCredentialsValidator =  joi.object().keys({
            password: joi.string().min(6).required(),
        });
    }

    public validate(data: any): TValidationResult {
        const joiResult = this._joiLocalCredentialsValidator.validate(data);
        const result = {
            error: joiResult.error,
            warning: joiResult.warning,
            value: joiResult.value,
        }
        return result;
    }
}