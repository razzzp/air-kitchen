import { Strategy } from "passport-local";
import Express from "express";
import { getMySQLDataSource } from "../repositories/typeorm-repositories/data-sources";
import crypto from "crypto";
import { UserValidator } from "../validators/joi/user-validator";
import { User } from "../entities/typeorm-entities/user";
import { LocalCredentials } from "../entities/typeorm-entities/local-credentials";
import { LocalCredentialsValidator } from "../validators/joi/local-credential-validator";
import { getUserRepository } from "../repositories/typeorm-repositories/repositories";

export class AuthenticationController {
    public static verifyLocalStrategy() {
    
    }

    private static _getUserValidator() {
        return new UserValidator()
    }

    private static _getLocalCredentialsValidator() {
        return new LocalCredentialsValidator()
    }

    private static async _isEmailUnique(email : string){
        const userRepo = getUserRepository();
        return (await userRepo.find({email: email})).length === 0;
    }

    public static async register(req: Express.Request, res: Express.Response, next: Express.NextFunction){
        const {email, name, password} = req.body;

        // validate password
        const localCredentialsValidator = AuthenticationController._getLocalCredentialsValidator();
        const localCredsValidationResult = localCredentialsValidator.validate({password});
        if (localCredsValidationResult.error){
            return next(localCredsValidationResult.error);
        }
        // validate user data
        const newUserData = {
            email: email,
            name: name,
        }
        const userValidator = AuthenticationController._getUserValidator();
        const userValidationResult = userValidator.validate(newUserData);
        // don't continue if error
        if (userValidationResult.error){
            return next(userValidationResult.error);
        }
        const validatedUser = userValidationResult.value;
        // check email doesn't exist
        if (!(await AuthenticationController._isEmailUnique(validatedUser.email))){
            return next("Email already exists");
        }
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
            savedUser = await entityManager.save(new User(validatedUser));
            // create localCredentials
            const newLocalCredentialsData = {
                user: savedUser,
                salt: salt,
                hash: hash
            }
            const savedLocalCredentials = await entityManager.save(new LocalCredentials(newLocalCredentialsData));
        })
        return res.json(savedUser);
    }
    
    public static getLocalStrategy(){
        return new Strategy(AuthenticationController.verifyLocalStrategy)
    }    
}
