
import  express from "express"
import { UserController } from "../../controllers/user-controller";
import { wrapFuncInTryCatch } from "../utils";


export const userRouter = express.Router();

userRouter.route('/users')
    .get(wrapFuncInTryCatch(UserController.retrieveUsers));
