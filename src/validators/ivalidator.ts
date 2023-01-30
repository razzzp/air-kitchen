import { IEntity } from "../entities/interfaces";

export type TValidationResult<T extends IEntity> = {
    error: any;
    warning?: any;
    value: T;
}

export interface IValidator<T extends IEntity> {
    validate(data : any) : TValidationResult<T>;
}