import { Router } from "express";
import {
    VendorPagination,
    addAlbumPhotos,
    addBanquet,
    addMenu,
    addPhotographyServices,
    addProjectAlbum,
    addProjectVideo,
    banquetsPagination,
    deleteAlbumPhotos,
    deleteBanquet,
    deleteMenu,
    deleteProjectAlbums,
    deleteProjectVideos,
    getAlbumById,
    getAllBanquets,
    getBanquetById,
    getBanquets,
    getMenuById,
    getMenus,
    getPhotographyServices,
    getProjectAlbums,
    getProjectVideos,
    getUserMembershipPlan,
    getVendorById,
    getVendorCategory,
    getVendorProject,
    getVendorsByCategory,
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
    projectValidator,
} from "../middlewares/validateImages.js";

const vendorRouter = Router();

//vendor authentication
vendorRouter.route("/signup").post(registerVendor);
vendorRouter.route("/login").post(loginVendor);

//protected routes
vendorRouter.route("/getvendors").get(verifyToken, getVendorCategory);
vendorRouter.route("/updatevendor/:id").patch(verifyToken, updateVendor);
vendorRouter
    .route("/update-additional-details/:id")
    .put(verifyToken, updateAdditionalDetails);
vendorRouter.route("/get-vendor").get(getVendorById);
vendorRouter.route("/vendor-pagination").get(VendorPagination);

// get vendors by category
vendorRouter
    .route("/get-vendors-category")
    .get(verifyToken, getVendorsByCategory);

// COMMON FUNCTIONALITY
// projects
vendorRouter.route("/get-project").get(getVendorProject);
vendorRouter
    .route("/add-project-album/:id")
    .post(verifyToken, projectValidator, addProjectAlbum);
vendorRouter.route("/add-project-video/:id").post(verifyToken, addProjectVideo);
vendorRouter
    .route("/get-project-albums/:id")
    .get(verifyToken, getProjectAlbums);
vendorRouter.route("/get-vendor-album").get(verifyToken, getAlbumById);
vendorRouter
    .route("/get-project-videos/:id")
    .get(verifyToken, getProjectVideos);
vendorRouter
    .route("/delete-project-videos/:id")
    .delete(verifyToken, deleteProjectVideos);
vendorRouter
    .route("/delete-project-album/:id")
    .delete(verifyToken, deleteProjectAlbums);
vendorRouter
    .route("/delete-album-photos/:id")
    .delete(verifyToken, deleteAlbumPhotos);
vendorRouter
    .route("/add-album-photos/:id")
    .post(verifyToken, projectValidator, addAlbumPhotos);

// VENUE
// menu
vendorRouter.route("/add-menu/:id").post(verifyToken, addMenu);
vendorRouter.route("/get-menus/:id").get(verifyToken, getMenus);
vendorRouter.route("/get-menu").get(verifyToken, getMenuById);
vendorRouter.route("/delete-menu/:id").delete(verifyToken, deleteMenu);
vendorRouter.route("/update-menu/:id").put(verifyToken, updateMenu);
// banquets
vendorRouter
    .route("/add-banquet/:id")
    .post(verifyToken, imageValidator, addBanquet);
vendorRouter.route("/get-banquets/:id").get(verifyToken, getBanquets);
vendorRouter.route("/get-banquet").get(getBanquetById);
vendorRouter.route("/delete-banquet/:id").delete(verifyToken, deleteBanquet);
vendorRouter
    .route("/update-banquet/:id")
    .put(verifyToken, updatedImageValidator, updateBanquet);
vendorRouter.route("/get-all-banquets").get(getAllBanquets);
vendorRouter.route("/banquets-pagination").get(banquetsPagination);

// PHOTOGRAPHERS
// services
vendorRouter
    .route("/add-services/:id")
    .post(verifyToken, addPhotographyServices);
vendorRouter.route("/get-services").get(verifyToken, getPhotographyServices);

// MEMBERSHIP PLANS
vendorRouter
    .route("/get-membership-details")
    .get(verifyToken, getUserMembershipPlan);

export default vendorRouter;
