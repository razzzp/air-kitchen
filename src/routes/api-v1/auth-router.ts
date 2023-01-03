
import  express from "express"
import passport from "passport";
import { AuthenticationController } from "../../auth/auth";


export const authRouter = express.Router();

authRouter.route('/register')
    .post(AuthenticationController.register);
    
authRouter.route('/login')
    .post(
        passport.authenticate('basic', {session:false}),
        AuthenticationController.login
    );