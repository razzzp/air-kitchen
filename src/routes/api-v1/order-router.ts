
import  express from "express"
import passport from "passport";
import { OrderController } from "../../controllers/order-controller";

export const orderRouter = express.Router();

orderRouter.route('/orders')
    .get(
        passport.authenticate(['basic'],{session:false}),
        OrderController.retrieveOrders)
    .post(
        passport.authenticate(['basic'],{session:false}),
        OrderController.createOrder);

orderRouter.route('/orders/:id')
    .get()
    .put()
    .delete();