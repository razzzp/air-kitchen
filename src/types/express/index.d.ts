import { IOrder, IUser } from "../../entities/interfaces";


// extends Express types 
declare global {
    namespace Express {
        // These open interfaces may be extended in an application-specific manner via declaration merging.
        // See for example method-override.d.ts (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/method-override/index.d.ts)
        // user object should already follow IUser
        export interface User extends IUser{}
        
        export interface Request {
            // Request object may have orderEntity assigned to it
            orderEntity?: IOrder
        }
    }
}