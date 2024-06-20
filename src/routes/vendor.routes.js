import { Router } from "express";
import {
    addAlbumPhotos,
    addBanquet,
    addMenu,
    addProjectAlbum,
    addProjectVideo,
    deleteAlbumPhotos,
    deleteBanquet,
    deleteMenu,
    deleteProjectAlbums,
    deleteProjectVideos,
    getAlbumById,
    getBanquetById,
    getBanquets,
    getMenus,
    getProjectAlbums,
    getProjectVideos,
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
    projectValidator,
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

// COMMON FUNCTIONALITY
// projects
vendorRouter
    .route("/add-project-album/:id")
    .post(verifyToken, projectValidator, addProjectAlbum);
vendorRouter.route("/add-project-video/:id").post(verifyToken, addProjectVideo);
vendorRouter
    .route("/get-project-albums/:id")
    .get(verifyToken, getProjectAlbums);
vendorRouter
    .route("/get-vendor-album")
    .get(verifyToken, getAlbumById);
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
vendorRouter.route("/get-menu/:id").get(verifyToken, getMenus);
vendorRouter.route("/delete-menu/:id").delete(verifyToken, deleteMenu);
vendorRouter.route("/update-menu/:id").put(verifyToken, updateMenu);
// banquets
vendorRouter
    .route("/add-banquet/:id")
    .post(verifyToken, imageValidator, addBanquet);
vendorRouter.route("/get-banquets/:id").get(verifyToken, getBanquets);
vendorRouter.route("/get-banquet").get(verifyToken, getBanquetById);
vendorRouter.route("/delete-banquet/:id").delete(verifyToken, deleteBanquet);
vendorRouter
    .route("/update-banquet/:id")
    .put(verifyToken, updatedImageValidator, updateBanquet);

export default vendorRouter;
