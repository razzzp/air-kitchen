
import Joi from "joi";

export const isValidId = (Id: any) : Id is number => {
    // valid id is a positive integer
    //  if no error it is a valid id
    const valResult = Joi.number().positive().integer().required().validate(Id);
    return !(valResult.error) ;
}

