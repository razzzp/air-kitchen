
import joi from "joi";
import { JoiValidator } from "./joi-validator";
import { IUser } from "../../entities/interfaces";

export class UserValidator extends JoiValidator<IUser>{

    public static getDisplayNameValidator() {
        // alphanumeric with spaces allowed except for leading and trailling spaces
        return joi.string().max(64).regex(/^\w+(?:\s+\w+)*\S$/);
    }
    /**
     *
     */
    constructor() {
        super();
        this._joiValidator =  joi.object().keys({
            email: joi.string().max(64).required().email(),
            username: joi.string().max(64).alphanum(),
            displayName: UserValidator.getDisplayNameValidator()
        });
    }
}