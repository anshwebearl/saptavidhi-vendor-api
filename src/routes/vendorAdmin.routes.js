import { Router } from "express";
import {
    changeAdminPassword,
    changeVendorStatus,
    createVendorCategory,
    createVendorProperty,
    createVendorSubCategory,
    deleteVendorCategory,
    deleteVendorProperty,
    deleteVendorSubCategory,
    getAdmin,
    getBanquets,
    getVendors,
    loginVendorAdmin,
    updateVendorCategory,
    updateVendorProperty,
    updateVendorSubCategory,
    getMenus
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
    .route("/update-vendor-category/:id")
    .put(verifyToken, updateVendorCategory);
vendorAdminRouter
    .route("/delete-vendor-category/:id")
    .delete(verifyToken, deleteVendorCategory);

// vendor subcategory
vendorAdminRouter
    .route("/add-vendor-subcategory/:id")
    .put(verifyToken, createVendorSubCategory);
vendorAdminRouter
    .route("/delete-vendor-subcategory/:id")
    .delete(verifyToken, deleteVendorSubCategory);
vendorAdminRouter
    .route("/update-vendor-subcategory/:id")
    .put(verifyToken, updateVendorSubCategory);

// vendor property
vendorAdminRouter
    .route("/add-vendor-property/:id")
    .put(verifyToken, createVendorProperty);
vendorAdminRouter
    .route("/delete-vendor-property/:id")
    .delete(verifyToken, deleteVendorProperty);
vendorAdminRouter
    .route("/update-vendor-property/:id")
    .put(verifyToken, updateVendorProperty);

// vendor category - Venues
vendorAdminRouter.route("/get-menu/:id").get(verifyToken, getMenus);
vendorAdminRouter.route("/get-banquet/:id").get(verifyToken, getBanquets);

export default vendorAdminRouter;
