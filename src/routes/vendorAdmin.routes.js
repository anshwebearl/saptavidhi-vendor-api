import { Router } from "express";
import {
    changeAdminPassword,
    changeVendorStatus,
    getAdmin,
    getVendors,
    loginVendorAdmin,
    // registerVendorAdmin,
} from "../controllers/vendorAdmin.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyOtp from "../middlewares/verifyOtp.js";

const vendorAdminRouter = Router();

// vendorAdminRouter.route("/register").post(registerVendorAdmin);
vendorAdminRouter.route("/login").post(loginVendorAdmin);

vendorAdminRouter
    .route("/changepassword/:id")
    .post(verifyOtp, changeAdminPassword);

vendorAdminRouter.route("/getvendors").get(verifyToken, getVendors);

vendorAdminRouter.route("/getvendors/:id").get(verifyToken, getVendors);

vendorAdminRouter.route("/getAdmin").get(verifyToken, getAdmin);

vendorAdminRouter
    .route("/update-vendor-status/:id")
    .put(verifyToken, changeVendorStatus);

export default vendorAdminRouter;
