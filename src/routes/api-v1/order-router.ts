
import  express from "express";
import passport from "passport";
import { OrderController } from "../../controllers/order-controller";
import { wrapFuncInTryCatch } from "../utils";

export const orderRouter = express.Router();

orderRouter.route('/orders')
    .get(
        passport.authenticate(['basic','bearer'],{session:false}),
        wrapFuncInTryCatch(OrderController.retrieveOrders)
    )
    .post(
        passport.authenticate(['basic','bearer'],{session:false}),
        wrapFuncInTryCatch(OrderController.createOrder)
    );

orderRouter.route('/orders/:orderId')
    .get(
        passport.authenticate(['basic','bearer'],{session:false}),
        wrapFuncInTryCatch(OrderController.getOrder),
        wrapFuncInTryCatch(OrderController.authorizeUserForOrder),
        wrapFuncInTryCatch(OrderController.retrieveOrder)
    )
    .put(
        passport.authenticate(['basic','bearer'],{session:false}),
        wrapFuncInTryCatch(OrderController.getOrder),
        wrapFuncInTryCatch(OrderController.authorizeUserForOrder),
        wrapFuncInTryCatch(OrderController.updateOrder)
    )
    .delete(
        passport.authenticate(['basic','bearer'],{session:false}),
        wrapFuncInTryCatch(OrderController.getOrder),
        wrapFuncInTryCatch(OrderController.authorizeUserForOrder),
        wrapFuncInTryCatch(OrderController.deleteOrder)
    );