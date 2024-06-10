import { Router } from "express";
import {
    changeAdminPassword,
    changeVendorStatus,
    createVendorCategory,
    createVendorProperty,
    createVendorSubCategory,
    getAdmin,
    getVendors,
    loginVendorAdmin,
    // registerVendorAdmin,
} from "../controllers/vendorAdmin.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyOtp from "../middlewares/verifyOtp.js";

const vendorAdminRouter = Router();

// vendorAdminRouter.route("/register").post(registerVendorAdmin);

// admin authentication
vendorAdminRouter.route("/login").post(loginVendorAdmin);
vendorAdminRouter
    .route("/changepassword/:id")
    .post(verifyOtp, changeAdminPassword);
vendorAdminRouter.route("/getAdmin").get(verifyToken, getAdmin);

// vendors
vendorAdminRouter
    .route("/update-vendor-status/:id")
    .put(verifyToken, changeVendorStatus);
vendorAdminRouter.route("/getvendors").get(verifyToken, getVendors);
vendorAdminRouter.route("/getvendors/:id").get(verifyToken, getVendors);

// vendor category
vendorAdminRouter
    .route("/create-vendor-category")
    .post(verifyToken, createVendorCategory);
vendorAdminRouter
    .route("/add-vendor-subcategory")
    .put(verifyToken, createVendorSubCategory);
vendorAdminRouter
    .route("/add-vendor-property")
    .put(verifyToken, createVendorProperty);

export default vendorAdminRouter;
