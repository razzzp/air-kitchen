import Express from "express";
import getMySQLDataSource from "../data-sources/typeorm-datasource";
import crypto from "crypto";
import { UserValidator } from "../validators/joi/user-validator";
import { User } from "../entities/typeorm-entities/user";
import { LocalCredentials } from "../entities/typeorm-entities/local-credentials";
import { LocalCredentialsValidator } from "../validators/joi/local-credential-validator";
import { getAccessTokenRepository, getRefreshTokenRepository, getUserRepository } from "../repositories/typeorm-repositories/repositories";
import { IAccessTokenCredential, ILocalCredentials, IUser } from "../entities/interfaces";
import { getLocalCredentialsRepository } from "../repositories/typeorm-repositories/repositories";
import { BasicStrategy } from 'passport-http';
import { OAuth2Client } from "google-auth-library";
import { RefreshTokenCredentials } from "../entities/typeorm-entities/refresh-token-credentials";
import { AccessTokenCredentials } from "../entities/typeorm-entities/bearer-token-credentials";
import { dateAdd } from "../utils/dates";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import { MoreThan } from "typeorm";

const CLIENT_ID = '325790205622-r4pns2qk3lni19mrud8pvlp69dc3q4ea.apps.googleusercontent.com';


export class AuthenticationController {
    private static async _getCredentials(username :string) : Promise<ILocalCredentials> {
        const localCredentialsRepo = getLocalCredentialsRepository();
        const foundCreds = await localCredentialsRepo.repo.findBy({user:{username:username}});
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

    private static async _verifyBasicCredentialsAndGetUser(username: string, password: string): Promise<{err?: string,user?: IUser}> {
        // search for credentials with corresponding user name
        const localCred = await AuthenticationController._getCredentials(username);
        if (!localCred) return {err: 'Wrong username/password'};
        const calcHash = AuthenticationController._calculateHash(password, localCred.salt);
        if (calcHash.equals(localCred.hash)){
            return {user: localCred.user};
        } else {
            return {err: 'Wrong username/password'};
        }
    }

    private static async _verifyBasicStrategy(
        username: string,
        password: string,
        done: (error: any, user?: any) => void
    ) {
        // wrap in try catch to prevent crashing
        try {
            // search for credentials with corresponding user name
            const {err, user} = await AuthenticationController._verifyBasicCredentialsAndGetUser(username, password);
            if (err) return done('Wrong username/password', false);
            else return done(null, user);
        } catch (error) {
            return done(`Something went wrong\n${error}`, false);
        }     
    }

    private static async _verifyBearerStrategy(
        token: string,
        done: (error: any, user?: any) => void
    ) {
        if (token === '') return done('Empty token', false);

        const tokenAsBuffer = Buffer.from(token, 'base64');
        const accessTokenRepo = getAccessTokenRepository();
        // searchs creds with matching tokens that is not expired
        try {
            const foundCreds = await accessTokenRepo.findOneBy({token: tokenAsBuffer, expiryDate: MoreThan(new Date())});
            if (foundCreds) {
                done(null, foundCreds.user);
            } else {
                done('Invalid token', false);
            }
        } catch (e) {
            done(e, false);
        } 
    }

    private static _getUserValidator() {
        return new UserValidator();
    }

    private static _getLocalCredentialsValidator() {
        return new LocalCredentialsValidator();
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
        const {email, username, password, displayName} = req.body;

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
            displayName: displayName ? displayName : username
        };
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
        const salt = crypto.randomBytes(16);
        const hash = AuthenticationController._calculateHash(password, salt);
        
        let savedUser = null;
        // use transaction to save the user and credentials
        const transaction = await getMySQLDataSource().transaction(async (entityManager) => {
            savedUser = await entityManager.save(new User(validatedUser));
            // create localCredentials
            const newLocalCredentialsData = {
                user: savedUser,
                salt: salt,
                hash: hash,
            };
            const savedLocalCredentials = await entityManager.save(new LocalCredentials(newLocalCredentialsData));
        });
        return res.json(savedUser);
    }

    private static _isDataValidForLogin(data: any) : data is {username: string, password: string} {
        if(data && "username" in data
            && typeof (data.username) ==="string" 
            && "password" in data
            && typeof (data.password) ==="string") return true;
        else return false;
    }

    /**
     * generates unique refresh and bearer tokens
     */
    private static async _generateTokens(): Promise<{refreshToken: Buffer,accessToken: Buffer}> {
        const refreshTokenRepo = getRefreshTokenRepository();
        const accessTokenRepo = getAccessTokenRepository();

        let refreshToken = crypto.randomBytes(32);
        while((await refreshTokenRepo.findBy({token: refreshToken})).length > 0) {
            refreshToken = crypto.randomBytes(32);
        }

        let accessToken = crypto.randomBytes(32);
        while((await accessTokenRepo.findBy({token: accessToken})).length > 0) {
            accessToken = crypto.randomBytes(32);
        }

        return {
            refreshToken: refreshToken,
            accessToken: accessToken
        };
    }

    private static async _deleteExistingTokens(ForUser: IUser) : Promise<void>{
        const refreshTokenRepo = getRefreshTokenRepository();
        const accessTokenRepo = getAccessTokenRepository();

        const accessTokenDeleteResult = await accessTokenRepo.delete({user: ForUser});
        const refreshTokenDeleteResult = await refreshTokenRepo.delete({user: ForUser});
        // console.log(accessTokenDeleteResult);
        // console.log(refreshTokenDeleteResult);
    }

    public static async login(req: Express.Request, res: Express.Response, next: Express.NextFunction){ 
        if(!AuthenticationController._isDataValidForLogin(req.body)) return res.status(400).send('username and password should be a string');

        const { username, password} = req.body;
        try {
            // search for credentials with corresponding user name
            const {err, user} = await AuthenticationController._verifyBasicCredentialsAndGetUser(username, password);
            if (err) return res.status(401).send(err);

            // delete existing tokens
            await AuthenticationController._deleteExistingTokens(user);

            // generate  tokens
            const tokens = await AuthenticationController._generateTokens();
            const newRefreshTokenCreds = new RefreshTokenCredentials({
                user: user,
                token: tokens.refreshToken,
                expiryDate: dateAdd(new Date(), 'hour', 1)
            });
            let savedAccessTokenCreds: IAccessTokenCredential;
            // save both refresh and bearer tokens
            const transaction = await getMySQLDataSource().transaction(async (entityManager) => {
                const savedRefreshTokenCreds = await entityManager.save(newRefreshTokenCreds);
                // create localCredentials
                const newAccessTokenCreds = new AccessTokenCredentials({
                    user: user,
                    token: tokens.accessToken,
                    refreshToken: savedRefreshTokenCreds,
                    expiryDate: dateAdd(new Date(), 'day', 14)
                });
                savedAccessTokenCreds = await entityManager.save(newAccessTokenCreds);
            });

            return res.json({
                tokenType: "bearer",
                accessToken: savedAccessTokenCreds.token.toString('base64'),
                expiryDate: savedAccessTokenCreds.expiryDate.getTime(),
                refreshToken: savedAccessTokenCreds.refreshToken.token.toString('base64')
            });
        } catch (error) {
            return next(`Something went wrong\n${error}`);
        }   
    }

    public static async testGoogleLogin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        const data = req.body;
        const client = new OAuth2Client(CLIENT_ID);
        try {
            const ticket = await client.verifyIdToken({
                idToken: data.credential,
                audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            const userid = payload ? payload['sub'] : null;
            // If request specified a G Suite domain:
            // const domain = payload['hd'];
            console.log(payload);
            return res.send(payload);
        } catch (e) {
            console.error(e);
            return next(e);
        }
    }
    
    public static getBasicStrategy(){
        return new BasicStrategy(AuthenticationController._verifyBasicStrategy);
    }

    public static getBearerStrategy(){
        return new BearerStrategy(AuthenticationController._verifyBearerStrategy);
    }
}
