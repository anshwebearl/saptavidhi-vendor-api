import { Router } from "express";
import {
    addBanquet,
    addMenu,
    deleteBanquet,
    deleteMenu,
    getBanquets,
    getMenus,
    getVendorDetails,
    loginVendor,
    registerVendor,
    updateAdditionalDetails,
    updateBanquet,
    updateMenu,
    updateVendor,
} from "../controllers/vendor.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import {
    imageValidator,
    updatedImageValidator,
} from "../middlewares/validateImages.js";

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
// menu
vendorRouter.route("/add-menu/:id").post(verifyToken, addMenu);
vendorRouter.route("/get-menu/:id").get(verifyToken, getMenus);
vendorRouter.route("/delete-menu/:id").delete(verifyToken, deleteMenu);
vendorRouter.route("/update-menu/:id").put(verifyToken, updateMenu);
// banquets
vendorRouter
    .route("/add-banquet/:id")
    .post(verifyToken, imageValidator, addBanquet);
vendorRouter.route("/get-banquets/:id").get(verifyToken, getBanquets);
vendorRouter.route("/delete-banquet/:id").delete(verifyToken, deleteBanquet);
vendorRouter
    .route("/update-banquet/:id")
    .put(verifyToken, updatedImageValidator, updateBanquet);

export default vendorRouter;
