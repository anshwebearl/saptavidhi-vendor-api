import { Router } from "express";
import {
    addMenu,
    deleteMenu,
    getMenus,
    getVendorDetails,
    loginVendor,
    registerVendor,
    updateAdditionalDetails,
    updateMenu,
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
    .put(verifyToken, updateAdditionalDetails);

// VENUE
vendorRouter.route("/add-menu/:id").post(verifyToken, addMenu);
vendorRouter.route("/get-menu/:id").get(verifyToken, getMenus);
vendorRouter.route("/delete-menu/:id").delete(verifyToken, deleteMenu);
vendorRouter.route("/update-menu/:id").put(verifyToken, updateMenu);

export default vendorRouter;
