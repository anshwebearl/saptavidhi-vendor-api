import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
    getPaymentStatus,
    initiatePayment,
} from "../controllers/payment.controller.js";

const paymentRouter = Router();

paymentRouter.route("/initiate-payment").post(verifyToken, initiatePayment);
paymentRouter.route("/get-payment-status").get(verifyToken, getPaymentStatus);

export default paymentRouter;
