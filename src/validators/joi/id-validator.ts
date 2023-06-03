
import Joi from "joi";

export const getIdValidator = () => Joi.number().positive().integer();

export const isValidId = (id: any) : id is number => {
    if (!id) return false;
    // valid id is a positive integer
    //  if no error it is a valid id
    const valResult = getIdValidator().validate(id);
    return !(valResult.error) ;
};

