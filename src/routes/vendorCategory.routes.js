import { Router } from "express";
import {
    getAllVendorCategories,
    getVendorAdditionalDetails,
} from "../controllers/vendorCategory.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const vendorCategoryRouter = Router();

vendorCategoryRouter.route("/getall").get(getAllVendorCategories);
vendorCategoryRouter
    .route("/get-additional-details/:vendor_type")
    .get(verifyToken, getVendorAdditionalDetails);

export default vendorCategoryRouter;
