
import  express from "express"
import passport from "passport";
import { AuthenticationController } from "../../auth/auth";
import { wrapFuncInTryCatch } from "../utils";


export const authRouter = express.Router();

authRouter.route('/register')
    .post(
        wrapFuncInTryCatch(AuthenticationController.register)
    );
    
authRouter.route('/login')
    .post(
        wrapFuncInTryCatch(AuthenticationController.login)
    );

authRouter.route('/login-google')
    .post(
        wrapFuncInTryCatch(AuthenticationController.testGoogleLogin)
    );