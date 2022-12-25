import { Strategy } from "passport-local";
import Express from "express";
import { UserController } from "../controllers/user-controller";
import { getMySQLDataSource } from "../repositories/typeorm-repositories/data-sources";
import crypto from "crypto";
import { UserValidator } from "../validators/joi/user-validator";
import { User } from "../entities/typeorm-entities/user";

export class AuthenticationController {
    public static verifyLocalStrategy() {
    
    }


    public static async register(req: Express.Request, res: Express.Response, next: Express.NextFunction){
        const {email, name, password} = req.body;
        // password cannot be too short
        if (typeof password !== 'string' || password.length < 6) {
            next('Password should be at least 6 characters.')
        }
        // validate user data
        const newUserData = {
            email: email,
            name: name,
        }
        const userValidator = new UserValidator();
        const userValidationResult = userValidator.validate(newUserData);
        // don't continue if error
        if (userValidationResult.error){
            next(userValidationResult.error);
        }

        const validatedUser = userValidationResult.value;
        // generate 32 byte hash using pbkdf2'
        //  using 16 bytes salt
        //  310,000 iterations,
        //  sha-256
        const salt = crypto.randomBytes(16)
        const hash = crypto.pbkdf2Sync(
            password, 
            salt,
            310000,
            32,
            'sha256');
        
        let savedUser = null;
        // use transaction to save the user and credentials
        const transaction = await getMySQLDataSource().transaction(async (entityManager) => {
            savedUser = await entityManager.save(validatedUser);
            // create localCredentials
            const newLocalCredentialsData = {
                user: savedUser,
                salt: salt,
                hash: hash
            }
            const savedLocalCredentials = entityManager.save(newLocalCredentialsData)
        })
        res.json(savedUser);
    }
    
    public static getLocalStrategy(){
        return new Strategy(AuthenticationController.verifyLocalStrategy)
    }    
}
