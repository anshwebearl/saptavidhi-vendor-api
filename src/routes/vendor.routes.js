import { Router } from "express";
import {
    getVendorDetails,
    loginVendor,
    registerVendor,
} from "../controllers/vendor.controller.js";
import vefiryToken from "../middlewares/verifyToken.js";

const vendorRouter = Router();

vendorRouter.route("/signup").post(registerVendor);
vendorRouter.route("/login").post(loginVendor);
vendorRouter.route("/getvendors").get(vefiryToken, getVendorDetails);

export default vendorRouter;
