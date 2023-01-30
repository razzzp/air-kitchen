
import joi from "joi";
import { ILocalCredentials } from "../../entities/interfaces";
import { JoiValidator } from "./joi-validator";

export class LocalCredentialsValidator extends JoiValidator<ILocalCredentials>{

    /**
     *
     */
    constructor() {
        super();
        this._joiValidator =  joi.object().keys({
            password: joi.string().min(6).required(),
        });
    }
}