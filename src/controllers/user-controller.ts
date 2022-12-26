import { getUserRepository } from "../repositories/typeorm-repositories/repositories";
import { IValidator } from "../validators/ivalidator";
import { UserValidator } from "../validators/joi/user-validator";
import Express from "express";
import { User } from "../entities/typeorm-entities/user";
import { IUser } from "../entities/interfaces";

export class UserController {
    protected static _getNewValidator(): IValidator{
        return new UserValidator();
    }

    /**
     * retrieves all orders
     * @param req express request object
     * @param res express response object
     * @param next express next function
     */
    public static async retrieveUsers(req : Express.Request, res : Express.Response, next : Express.NextFunction) {
        const userRepo = getUserRepository();
        const queryResults = await userRepo.find();
        const viewResults = queryResults.map((curUser)=> {
            return {
                id : curUser.id,
                creationDate : curUser.creationDate.toString(),
                email: curUser.email,
                name : curUser.name,
            };
        });
        return res.json(viewResults);
    }

    /**
     * creates a new order from data provided in the request body
     * @param req 
     * @param res 
     * @param next 
     */
    public static async createUser(userData: IUser) : Promise<IUser>{
        // parse and validate body
        console.log(userData); 
        const orderValidator = UserController._getNewValidator();
        const validationResult = orderValidator.validate(userData);
       
        // const queryResults = orderRepo.save();
        if (!validationResult.error){
            const userRepo = getUserRepository();
            const newUser = new User(validationResult.value);
            const savedUser = await userRepo.save(newUser);
            return savedUser;
        } else {
            // throw new Error('something went wrong :(');
            // throw new Error(validationResult.error.annotate());
            throw Error(validationResult.error);
        } 
    }
}