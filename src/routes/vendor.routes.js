import { Router } from "express";
import {
    loginVendor,
    registerVendor,
} from "../controllers/vendor.controller.js";

const vendorRouter = Router();

vendorRouter.route("/signup").post(registerVendor);
vendorRouter.route("/login").post(loginVendor);

export default vendorRouter;
