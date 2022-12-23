
export type TValidationResult = {
    error: any;
    warning?: any;
    value: any;
}

export interface IValidator {
    validate(data : any) : TValidationResult;
}