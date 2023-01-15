import Express from "express";
import { getMySQLDataSource } from "../repositories/typeorm-repositories/data-sources";
import crypto from "crypto";
import { UserValidator } from "../validators/joi/user-validator";
import { User } from "../entities/typeorm-entities/user";
import { LocalCredentials } from "../entities/typeorm-entities/local-credentials";
import { LocalCredentialsValidator } from "../validators/joi/local-credential-validator";
import { getUserRepository } from "../repositories/typeorm-repositories/repositories";
import { ILocalCredentials, IUser } from "../entities/interfaces";
import { getLocalCredentialsRepository } from "../repositories/typeorm-repositories/repositories"
import { BasicStrategy } from 'passport-http'

export class AuthenticationController {
    private static async _getCredentials(username :string) : Promise<ILocalCredentials> {
        const localCredentialsRepo = getLocalCredentialsRepository()
        const foundCreds = await localCredentialsRepo.repo.find({
            relations: {
                user: true
            },
            where :{
                user:{
                    username:username
                }
            }
        });
        return foundCreds.length>0 ? foundCreds[0] : null;
    }

    private static _calculateHash(password: string, salt: Buffer) : Buffer {
        return crypto.pbkdf2Sync(
            password, 
            salt,
            310000,
            32,
            'sha256');
    }

    public static async verifyBasicStrategy(
        username: string,
        password: string,
        done: (error: any, user?: any) => void,) {
            // wrap in try catch to prevent crashing
            try {
                 // search for credentials with corresponding user name
                const localCred = await AuthenticationController._getCredentials(username);
                if (!localCred) return done('Wrong username/password', false);
                const calcHash = AuthenticationController._calculateHash(password, localCred.salt);
                if (calcHash.equals(localCred.hash)){
                    return done(null, localCred.user);
                } else {
                    return done('Wrong username/password', false);
                }
            } catch (error) {
                return done(`Something went wrong\n${error}`, false);
            }     
    }

    private static _getUserValidator() {
        return new UserValidator()
    }

    private static _getLocalCredentialsValidator() {
        return new LocalCredentialsValidator()
    }

    private static async _isEmailUnique(email : string){
        const userRepo = getUserRepository();
        return (await userRepo.find({where:{email: email}})).length === 0;
    }

    private static async _isUsernameUnique(username : string){
        const userRepo = getUserRepository();
        return (await userRepo.find({where:{username: username}})).length === 0;
    }

    public static async register(req: Express.Request, res: Express.Response, next: Express.NextFunction){
        const {email, username, password} = req.body;

        // validate password
        const localCredentialsValidator = AuthenticationController._getLocalCredentialsValidator();
        const localCredsValidationResult = localCredentialsValidator.validate({password});
        if (localCredsValidationResult.error){
            return next(localCredsValidationResult.error);
        }
        // validate user data
        const newUserData = {
            email: email,
            username: username,
        }
        const userValidator = AuthenticationController._getUserValidator();
        const userValidationResult = userValidator.validate(newUserData);
        // don't continue if error
        if (userValidationResult.error){
            return next(userValidationResult.error);
        }
        // should be safe todo
        const validatedUser = <IUser>(userValidationResult.value);
        // check email doesn't exist
        if (!(await AuthenticationController._isEmailUnique(validatedUser.email))){
            return next("Email already exists");
        }
        // check username doesn't exist
        if (!(await AuthenticationController._isUsernameUnique(validatedUser.username))){
            return next("Username already exists");
        }
        // generate 32 byte hash using pbkdf2'
        //  using 16 bytes salt
        //  310,000 iterations,
        //  sha-256
        const salt = crypto.randomBytes(16)
        const hash = AuthenticationController._calculateHash(password, salt);
        
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

    public static async login(req: Express.Request, res: Express.Response, next: Express.NextFunction){ 
        if(req.user) {
            res.json(req.user);
        } else {
            res.send('failed to login...');
        }
    }
    
    public static getBasicStrategy(){
        return new BasicStrategy(AuthenticationController.verifyBasicStrategy)
    }    
}
