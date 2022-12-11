
import  express from "express"
import { OrderController } from "../../controllers/order-controller";

export const orderRouter = express.Router();

orderRouter.route('/orders')
    .get(OrderController.retrieveOrders)
    .post();

orderRouter.route('/orders/:id')
    .get()
    .put()
    .delete();