
import * as Express from "express";
import passport from "passport";
import { OrderController } from "../../controllers/order-controller";
import { wrapFuncInTryCatch } from "../utils";
import { OrderViewBuilder } from "../../views/view-builder";
import { buildOrderRepository } from "../../repositories/typeorm-repositories/repositories";

export const orderRouter = function() {
    const orderRouter = Express.Router();
    const orderRepo = buildOrderRepository();

    const orderViewBuilder = new OrderViewBuilder();
    const orderController = new OrderController(orderViewBuilder, orderRepo);

    orderRouter.route('/orders')
        .get(
            passport.authenticate(['basic','bearer'],{session:false}),
            wrapFuncInTryCatch(orderController.retrieveOrders.bind(orderController))
        )
        .post(
            passport.authenticate(['basic','bearer'],{session:false}),
            wrapFuncInTryCatch(orderController.createOrder.bind(orderController))
        );

    orderRouter.route('/orders/:orderId')
        .get(
            passport.authenticate(['basic','bearer'],{session:false}),
            wrapFuncInTryCatch(orderController.getAndSetOrder.bind(orderController)),
            wrapFuncInTryCatch(orderController.authorizeUserForOrder.bind(orderController)),
            wrapFuncInTryCatch(orderController.retrieveOrder.bind(orderController)),
        )
        .put(
            passport.authenticate(['basic','bearer'],{session:false}),
            wrapFuncInTryCatch(orderController.getAndSetOrder.bind(orderController)),
            wrapFuncInTryCatch(orderController.authorizeUserForOrder.bind(orderController)),
            wrapFuncInTryCatch(orderController.updateOrder.bind(orderController))
        )
        .delete(
            passport.authenticate(['basic','bearer'],{session:false}),
            wrapFuncInTryCatch(orderController.getAndSetOrder.bind(orderController)),
            wrapFuncInTryCatch(orderController.authorizeUserForOrder.bind(orderController)),
            wrapFuncInTryCatch(orderController.deleteOrder.bind(orderController))
        );
    return orderRouter;
};
    

