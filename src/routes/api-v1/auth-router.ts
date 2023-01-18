
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
        passport.authenticate('basic', {session:false}),
        wrapFuncInTryCatch(AuthenticationController.login)
    );

authRouter.route('/testgooglelogin')
    .post(
        wrapFuncInTryCatch(AuthenticationController.testGoogleLogin)
    );