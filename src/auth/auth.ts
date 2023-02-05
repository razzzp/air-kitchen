import Express from "express";
import getMySQLDataSource from "../data-sources/typeorm-datasource";
import crypto from "crypto";
import { UserValidator } from "../validators/joi/user-validator";
import { User } from "../entities/typeorm-entities/user";
import { LocalCredentials } from "../entities/typeorm-entities/local-credentials";
import { LocalCredentialsValidator } from "../validators/joi/local-credential-validator";
import { getAccessTokenRepository, getFederatedCredentialsRepository, getRefreshTokenRepository, getUserRepository } from "../repositories/typeorm-repositories/repositories";
import { IAccessTokenCredential, IFederatedCredentials, ILocalCredentials, IRefreshTokenCredential, ITokenCredential, IUser } from "../entities/interfaces";
import { getLocalCredentialsRepository } from "../repositories/typeorm-repositories/repositories";
import { BasicStrategy } from 'passport-http';
import { OAuth2Client } from "google-auth-library";
import { RefreshTokenCredentials } from "../entities/typeorm-entities/refresh-token-credentials";
import { AccessTokenCredentials } from "../entities/typeorm-entities/access-token-credentials";
import { dateAdd } from "../utils/dates";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import { MoreThan } from "typeorm";
import { IRepository } from "../repositories/interfaces";
import dotenv from 'dotenv';
import { TValidationResult } from "../validators/ivalidator";
import { userInfo } from "os";


function _getGoogleClientID(){
    dotenv.config();
    const clientId = process.env.GOOGLE_AUTH_CLIENT_ID;
    return clientId;
}


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
            const foundCreds = await accessTokenRepo.findOneBy({
                token: tokenAsBuffer, 
                expiryDate: MoreThan(new Date())
            });
            if (foundCreds) {
                done(null, foundCreds.user);
            } else {
                done('Unauthorized', false);
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

    private static _validateUserData(data: any) : TValidationResult<IUser>{
        // validate user data
        const userValidator = AuthenticationController._getUserValidator();
        return userValidator.validate(data);
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
        const userValidationResult =AuthenticationController._validateUserData({
            email: email,
            username: username,
            displayName: displayName ? displayName : username
        });
        // don't continue if error
        if (userValidationResult.error){
            return next(userValidationResult.error);
        }
        // should be safe todo
        const validatedUser = <IUser>(userValidationResult.value);

        try {
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
        } catch (error) {
            return next(`Something went wrong\n${error}`);
        }
    }

    private static _isDataValidForLogin(data: any) : data is {username: string, password: string} {
        if(data && "username" in data
            && typeof (data.username) ==="string" 
            && "password" in data
            && typeof (data.password) ==="string") return true;
        else return false;
    }

    /**
     * 
     * @param ForTokenRepo Token credential repo
     * @returns generated token that is unique in the given repo
     */
    private static async _generateTokenForRepo<T extends ITokenCredential>(ForTokenRepo: IRepository<T>): Promise<Buffer> {
        let accessToken = crypto.randomBytes(32);
        while((await ForTokenRepo.findBy({token: accessToken})).length > 0) {
            accessToken = crypto.randomBytes(32);
        }
        return accessToken;
    }

    /**
     * generates unique refresh and bearer tokens
     */
    private static async _generateTokens(): Promise<{refreshToken: Buffer,accessToken: Buffer}> {
        const refreshTokenRepo = getRefreshTokenRepository();
        const accessTokenRepo = getAccessTokenRepository();

        const refreshToken = await AuthenticationController._generateTokenForRepo<RefreshTokenCredentials>(refreshTokenRepo);
        const accessToken = await AuthenticationController._generateTokenForRepo<AccessTokenCredentials>(accessTokenRepo);

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


    /**
     * Generates access token and refresh tokens for the user
     *  Deletes any exisiting tokens
     *  Returns the credential entities
     *  Can throw promise rejection Errors
     * @param user generates tokens for the user
     * @returns access token and refresh token credential entities
     */
    private static async _createBearerCredentialsForUser(user: IUser): Promise<{
        accessTokenCred: IAccessTokenCredential
        refreshTokenCred: IRefreshTokenCredential
    }> {
        // delete existing tokens
        await AuthenticationController._deleteExistingTokens(user);

        // generate  tokens
        const tokens = await AuthenticationController._generateTokens();
        const newRefreshTokenCreds = new RefreshTokenCredentials({
            user: user,
            token: tokens.refreshToken,
            expiryDate: dateAdd(new Date(), 'day', 14)
        });
        let savedAccessTokenCreds: IAccessTokenCredential;
        let savedRefreshTokenCreds: IRefreshTokenCredential;
        // save both refresh and bearer tokens
        const transaction = await getMySQLDataSource().transaction(async (entityManager) => {
            savedRefreshTokenCreds = await entityManager.save(newRefreshTokenCreds);
            // create localCredentials
            const newAccessTokenCreds = new AccessTokenCredentials({
                user: user,
                token: tokens.accessToken,
                refreshToken: savedRefreshTokenCreds,
                expiryDate: dateAdd(new Date(), 'hour', 1)
            });
            savedAccessTokenCreds = await entityManager.save(newAccessTokenCreds);
        });
        return {
            accessTokenCred: savedAccessTokenCreds,
            refreshTokenCred: savedRefreshTokenCreds
        };
    }

    /**
     * 
     * @param accessTokenCred 
     * @param refreshTokenCred 
     * @returns bearer credential object for user, with tokens encoded
     */
    private static _buildViewForBearerCredentials(accessTokenCred: IAccessTokenCredential, refreshTokenCred: IRefreshTokenCredential, user: IUser) {
        return {
            user: {displayName: user.displayName},
            tokenType: "bearer",
            accessToken: accessTokenCred.token.toString('base64'),
            expiryDate: accessTokenCred.expiryDate.getTime(),
            refreshToken: refreshTokenCred.token.toString('base64')
        };
    }

    public static async login(req: Express.Request, res: Express.Response, next: Express.NextFunction){ 
        if(!AuthenticationController._isDataValidForLogin(req.body)) return res.status(400).send('username and password should be a string');

        const { username, password} = req.body;
        try {
            // search for credentials with corresponding user name
            const {err, user} = await AuthenticationController._verifyBasicCredentialsAndGetUser(username, password);
            if (err) return res.status(401).send(err);

            const {accessTokenCred,refreshTokenCred} = await AuthenticationController._createBearerCredentialsForUser(user);

            return res.json(AuthenticationController._buildViewForBearerCredentials(accessTokenCred,refreshTokenCred,user));
        } catch (error) {
            return next(`Something went wrong\n${error}`);
        }   
    }

    public static async refreshToken(req: Express.Request, res: Express.Response, next: Express.NextFunction){ 
        const { refreshToken } = req.body;
        if (!refreshToken || typeof refreshToken !== 'string' || refreshToken === '') 
            return res.status(401).send('Invalid token');
        
        try {
            // check if the refresh token in valid
            const tokenAsBuffer = Buffer.from(refreshToken, 'base64');
            const refreshTokenRepo = getRefreshTokenRepository();
            const foundRefTokenCreds = await refreshTokenRepo.findOneBy({
                token: tokenAsBuffer,
                expiryDate: MoreThan(new Date())
            });

            if (foundRefTokenCreds) {
                // generate and save new access tokens
                const accessTokenRepo = getAccessTokenRepository();
                const newAccessToken = await AuthenticationController._generateTokenForRepo<AccessTokenCredentials>(accessTokenRepo);
                const newAccTokenCreds = {
                    user: foundRefTokenCreds.user,
                    token: newAccessToken,
                    expiryDate: dateAdd(new Date(), 'hour', 1),
                    refreshToken: foundRefTokenCreds
                };
                const savedAccTokenCreds = await accessTokenRepo.save(newAccTokenCreds);
                
                return res.json({
                    user: savedAccTokenCreds.user.id,
                    token: savedAccTokenCreds.token.toString('base64'),
                    expiryDate: savedAccTokenCreds.expiryDate
                });
            } else {
                return res.status(401).send('Invalid token');
            }
        } catch (error) {
            return next(`Something went wrong\n${error}`);
        }
        
    }


    public static async testGoogleLogin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
        const data = req.body;
        if (!data.credential || typeof(data.credential) !== 'string') return next('Credential field is required and should be a string');
        const client = new OAuth2Client(_getGoogleClientID());
        
        const ticket = await client.verifyIdToken({
            idToken: data.credential,
            audience: _getGoogleClientID(),  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        console.log(payload);
    
        // if valid google account, find/create user and then generate token creds
        //  return token creds. return user details if new user
        if(!payload) return next('Payload is undefined');
        // search for federated credentials
        const fedCredsRepo = getFederatedCredentialsRepository();
        const userRepo = getUserRepository();
        let fedCreds = await fedCredsRepo.findOneBy({issuer: payload.iss, issuerUserId: payload.sub});
        let user: IUser = null;
        if(!fedCreds){
            // If federated credentials not found:
            //  1. Check to see if there is a User with the same email
            //    a. If there is, take that user, and check status
            //    b. If none found, create new user
            //  2. Create federated credential for the user
            
            user = await userRepo.findOneBy({email: payload.email});
            if (!user) {
                // create user
                // validate user data
                const userValidationResult =AuthenticationController._validateUserData({
                    email: payload.email,
                    displayName: payload.name,
                });
                if (userValidationResult.error) return next(userValidationResult.error);
                user = await userRepo.save(userValidationResult.value);
            } 

            if (!user) return next('Failed to get/create user.');
            // Create federated credentials
            const newFedCreds: IFederatedCredentials = {
                user: user,
                issuer: payload.iss,
                issuerUserId: payload.sub
            };
            fedCreds = await fedCredsRepo.save(newFedCreds);   
        } else {
            // get user
            user = await userRepo.findOneBy({id:fedCreds.user.id});
        }
        // check fed cred issuerUser id is the same 
        if (!fedCreds) return next('Failed to get/create federated credentials');
        if (fedCreds.issuerUserId !== payload.sub) return next('Issuer user Id is inconsistent');

        // if fed creds available, create and return token credentials
        const {accessTokenCred,refreshTokenCred} = await AuthenticationController._createBearerCredentialsForUser(user);

        return res.json(AuthenticationController._buildViewForBearerCredentials(accessTokenCred,refreshTokenCred,user));
    }
    
    public static getBasicStrategy(){
        return new BasicStrategy(AuthenticationController._verifyBasicStrategy);
    }

    public static getBearerStrategy(){
        return new BearerStrategy(AuthenticationController._verifyBearerStrategy);
    }
}
