import { Router } from "express";
import {
    getVendorDetails,
    loginVendor,
    registerVendor,
    updateAdditionalDetails,
    updateVendor,
} from "../controllers/vendor.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const vendorRouter = Router();

//vendor authentication
vendorRouter.route("/signup").post(registerVendor);
vendorRouter.route("/login").post(loginVendor);

//protected routes
vendorRouter.route("/getvendors").get(verifyToken, getVendorDetails);
vendorRouter.route("/updatevendor/:id").patch(verifyToken, updateVendor);
vendorRouter
    .route("/update-additional-details/:id")
    .put(verifyToken, updateAdditionalDetails   );

export default vendorRouter;
