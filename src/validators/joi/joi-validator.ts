import Joi from "joi";
import { IEntity } from "../../entities/interfaces";
import { IValidator, TValidationResult } from "../ivalidator";

export abstract class JoiValidator<T extends IEntity> implements IValidator<T>{
    protected _joiValidator: Joi.Schema;

    public validate(data: any): TValidationResult<T> {
        const joiResult = this._joiValidator.validate(data);
        const result = {
            error: joiResult.error,
            warning: joiResult.warning,
            value: joiResult.value,
        };
        return result;
    }
}