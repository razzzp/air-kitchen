
import  express from "express"
import { AuthenticationController } from "../../auth/auth";


export const authRouter = express.Router();

authRouter.route('/register')
    .post(AuthenticationController.register);
