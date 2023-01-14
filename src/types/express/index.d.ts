import { IUser } from "../../entities/interfaces";


// extends Request object interface to use IUser
declare global {
    namespace Express {
        // These open interfaces may be extended in an application-specific manner via declaration merging.
        // See for example method-override.d.ts (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/method-override/index.d.ts)
        export interface User extends IUser{}
    }
}