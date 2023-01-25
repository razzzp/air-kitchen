
import Express from "express";

/**
 * Returns function where given function is called in try catch block.
 *  Catch block calls next function
 * @param func function to wrap
 * @returns 
 */
export function wrapFuncInTryCatch(
    func: (req:Express.Request, res: Express.Response, next: Express.NextFunction) => any
    ) : (req:Express.Request, res: Express.Response, next: Express.NextFunction) => any {
        return  async (req:Express.Request, res: Express.Response, next: Express.NextFunction) => {
            try{
                func(req, res, next);
            } catch(e) {
                next(e);
            }
        };
}