import { Router } from "express";
import {
    changeAdminPassword,
    getVendors,
    loginVendorAdmin,
    registerVendorAdmin,
} from "../controllers/vendorAdmin.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const vendorAdminRouter = Router();

vendorAdminRouter.route("/register").post(registerVendorAdmin);
vendorAdminRouter.route("/login").post(loginVendorAdmin);
vendorAdminRouter
    .route("/changepassword/:id")
    .post(verifyToken, changeAdminPassword);
vendorAdminRouter.route("/getvendors").get(verifyToken, getVendors);
vendorAdminRouter.route("/getvendors/:id").get(verifyToken, getVendors);

export default vendorAdminRouter;
