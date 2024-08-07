import { Vendor } from "../models/vendor.model.js";
import fs from "fs";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { VendorCategory } from "../models/vendorCategory.model.js";
import { VenueMenu } from "../models/Venue/venueMenu.model.js";
import { VenueBanquet } from "../models/Venue/venueBanquet.model.js";
import { VendorProject } from "../models/vendorProject.model.js";
import { PhotographerServices } from "../models/Photographer/photographerServices.model.js";
import mongoose from "mongoose";
import { Booking } from "../models/booking.models.js";
import { MembershipPlan } from "../models/membershipPlans.models.js";

const registerVendor = async (req, res) => {
    try {
        const {
            brand_name,
            contact_person_name,
            email,
            pincode,
            mobile_number,
            address,
            password,
            state,
            city,
            vendor_type,
        } = req.body;

        if (
            [
                brand_name,
                contact_person_name,
                email,
                pincode,
                mobile_number,
                address,
                password,
                state,
                city,
                vendor_type,
            ].some((x) => x === "")
        ) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "all fields are compulsory",
            });
        }

        const parsedMobileNumber = Number(mobile_number);

        const existingVendor = await Vendor.findOne({
            $or: [{ email }, { mobile_number: parsedMobileNumber }],
        });

        if (existingVendor) {
            return res.status(409).json({
                success: false,
                status: 409,
                message:
                    "vendor with the given email or mobile number already exists",
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const vendorCategory = await VendorCategory.findOne({
            name: vendor_type,
        });

        if (!vendorCategory) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Vendor type doesnot exist.",
            });
        }

        const additional_details = [];
        vendorCategory.categoryProperties.forEach((el) => {
            additional_details.push({
                _id: el._id,
                [el.propertyName]: el.propertyType === "multiSelect" ? [] : "",
            });
        });

        const vendor = await Vendor.create({
            brand_name,
            contact_person_name,
            email,
            pincode: Number(pincode),
            mobile_number: Number(mobile_number),
            address,
            password: encryptedPassword,
            state,
            city,
            vendor_type: vendorCategory._id,
            additional_details: additional_details,
            domain: "",
            additional_email: "",
            website_link: "",
            facebook_url: "",
            instagram_url: "",
            additional_info: "",
        });

        vendorCategory.vendor_id = vendor._id;
        await vendorCategory.save();

        await VendorProject.create({ vendor_id: vendor._id });

        if (vendor_type === "Photographers") {
            await PhotographerServices.create({ vendor_id: vendor._id });
        }

        const token = await generateToken(vendor._id);
        return res
            .status(201)
            .cookie("token", token, { httpOnly: true, secure: true })
            .json({
                token: token,
                status: 201,
                success: true,
            });
    } catch (error) {
        return res.status(404).json({
            status: 404,
            success: false,
            message: error,
        });
    }
};

const loginVendor = async (req, res) => {
    const { mobile_number, password } = req.body;

    if ([mobile_number, password].some((x) => x === "")) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: "all fields are compulsory",
        });
    }

    const existingVendor = await Vendor.findOne({ mobile_number });
    if (!existingVendor) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: "mobile number not registered",
        });
    }

    await bcrypt.compare(
        password,
        existingVendor.password,
        async (err, data) => {
            if (err) {
                console.log("error in bcrypt compare: ", err);
                return res.status(500);
            }
            if (data) {
                const token = await generateToken(existingVendor._id);
                return res
                    .status(200)
                    .cookie("token", token, {
                        httpOnly: true,
                        secure: true,
                        maxAge: 86400,
                    })
                    .json({
                        success: true,
                        status: 200,
                        token: token,
                    });
            } else {
                return res.status(401).json({
                    success: false,
                    status: 401,
                    message: "Invalid credentials",
                });
            }
        }
    );
};

const getVendorCategory = async (req, res) => {
    const { _id } = req.body.decoded;

    const vendor = await Vendor.findById({ _id }).select("-password");

    if (!vendor) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: "vendor does not exists",
        });
    }

    const vendorCategory = await VendorCategory.findById(
        vendor.vendor_type
    ).select("name");

    return res.status(200).json({
        success: true,
        status: 200,
        vendor: vendor,
        category: vendorCategory,
    });
};

const updateVendor = async (req, res) => {
    const requiredFields = [
        "brand_name",
        "contact_person_name",
        "email",
        "pincode",
        "mobile_number",
        "address",
        "state",
        "city",
    ];

    const updateData = {};
    const errors = [];

    requiredFields.forEach((field) => {
        if (req.body.hasOwnProperty(field)) {
            if (!req.body[field]) {
                errors.push(`${field} is required and cannot be empty`);
            } else {
                updateData[field] = req.body[field];
            }
        }
    });

    const optionalFields = [
        "domain",
        "additional_email",
        "website_link",
        "facebook_url",
        "instagram_url",
        "additional_info",
    ];

    optionalFields.forEach((field) => {
        if (req.body.hasOwnProperty(field)) {
            updateData[field] = req.body[field];
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors,
            status: 400,
        });
    }

    try {
        const updatedVendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedVendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
                status: 400,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Vendor details updated successfully",
            vendor: updatedVendor,
            status: 200,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating vendor details",
            error: error.message,
        });
    }
};

const updateAdditionalDetails = async (req, res) => {
    const id = req.params.id;

    const { additionalDetails } = req.body;

    if (!additionalDetails) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "additionalDetails is missing",
        });
    }

    try {
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor not found",
            });
        }

        vendor.additional_details = additionalDetails;

        await vendor.save();

        res.status(200).json({
            message: "Additional details updated successfully",
            vendor,
        });
    } catch (error) {
        console.error("Error updating additional details:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getVendorById = async (req, res) => {
    const { id } = req.query;

    if (!id || id.trim() === "") {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "id is required in the query.",
        });
    }

    try {
        const existingVendor = await Vendor.findById(id).select("-password");

        if (!existingVendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "vendor not found",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "vendor fetched successfully",
            vendor: existingVendor,
        });
    } catch (error) {
        console.log("error fetching vendor: ", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
        });
    }
};

// get vendors by category
const getVendorsByCategory = async (req, res) => {
    const { vendor_category } = req.query;

    if (!vendor_category || vendor_category.trim() === "") {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_category in query",
        });
    }

    try {
        const existingVendorCategory = await VendorCategory.findOne({
            name: vendor_category,
        });

        if (!existingVendorCategory) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "invalid vendor category",
            });
        }

        const vendorList = await Vendor.find({
            vendor_type: existingVendorCategory._id,
        });

        return res.status(200).json({
            status: 200,
            success: true,
            message: "vendors fetched successfully",
            vendorList: vendorList,
        });
    } catch (error) {
        console.log("error fetching vendors: ", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
        });
    }
};

const VendorPagination = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const vendorType = req.query.vendorType || "";

    const startIndex = (page - 1) * limit;

    try {
        const vendorCategory = await VendorCategory.findOne({
            name: vendorType,
        });

        if (!vendorCategory) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor category not found",
            });
        }

        const vendorCategoryId = vendorCategory._id;

        const aggregationPipeline = [
            {
                $match: {
                    vendor_type: new mongoose.Types.ObjectId(vendorCategoryId),
                },
            },
            {
                $lookup: {
                    from: "vendorprojects",
                    localField: "_id",
                    foreignField: "vendor_id",
                    as: "vendor_projects",
                },
            },
            {
                $unwind: {
                    path: "$vendor_projects",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    cover_photo: {
                        $arrayElemAt: [
                            {
                                $arrayElemAt: [
                                    "$vendor_projects.albums.photos",
                                    0,
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $skip: startIndex,
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    _id: 1,
                    brand_name: 1,
                    contact_person_name: 1,
                    email: 1,
                    pincode: 1,
                    mobile_number: 1,
                    address: 1,
                    state: 1,
                    city: 1,
                    vendor_type: 1,
                    additional_details: 1,
                    domain: 1,
                    additional_email: 1,
                    website_link: 1,
                    facebook_url: 1,
                    instagram_url: 1,
                    additional_info: 1,
                    status: 1,
                    cover_photo: 1,
                },
            },
        ];

        const vendors = await Vendor.aggregate(aggregationPipeline);

        const countPipeline = [
            {
                $match: {
                    vendor_type: new mongoose.Types.ObjectId(vendorCategoryId),
                },
            },
            {
                $count: "totalCount",
            },
        ];

        const countResult = await Vendor.aggregate(countPipeline);
        const totalCount =
            countResult.length > 0 ? countResult[0].totalCount : 0;

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Fetched vendors successfully",
            data: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount: totalCount,
                vendors: vendors,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal server error",
        });
    }
};

// COMMON FOR ALL CATEGORIES

// PROJECTS

const addProjectAlbum = async (req, res) => {
    const { id } = req.params;

    const { album_title } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    if (!album_title || album_title === "") {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide album_title in body",
        });
    }

    const photos = req.files["photos"].map((file) => file.path);

    try {
        let existingProject = await VendorProject.findOne({ vendor_id: id });
        existingProject.albums.push({
            album_title: album_title,
            photos: photos,
        });

        await existingProject.save();

        return res.status(201).json({
            status: 201,
            success: true,
            message: "album added successfully",
        });
    } catch (error) {
        console.error("Error adding project photos:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const addProjectVideo = async (req, res) => {
    const { id } = req.params;

    const { video_link } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    if (!video_link || video_link === "") {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide video_link in body",
        });
    }

    try {
        let existingProject = await VendorProject.findOne({ vendor_id: id });
        existingProject.videos.push(video_link);

        await existingProject.save();

        return res.status(201).json({
            status: 201,
            success: true,
            message: "video added successfully",
        });
    } catch (error) {
        console.error("Error adding project videos:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getProjectAlbums = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    try {
        let existingProject = await VendorProject.findOne({ vendor_id: id });
        if (!existingProject) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor Doesnot have any projects",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "project fetched successfully",
            albums: existingProject.albums,
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getAlbumById = async (req, res) => {
    const { vendor_id, album_id } = req.query;

    if (!vendor_id || !album_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id and album_id in query",
        });
    }

    try {
        let existingProject = await VendorProject.findOne({
            vendor_id: vendor_id,
        });
        if (!existingProject) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor Doesnot have any projects",
            });
        }

        const albumIndex = existingProject.albums.findIndex(
            (album) => album._id.toString() === album_id
        );

        if (albumIndex === -1) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Album not found",
            });
        }

        res.status(200).json({
            message: "Album fetched successfully",
            success: true,
            status: 200,
            album: existingProject.albums[albumIndex],
        });
    } catch (error) {
        console.error("Error adding album photos:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getProjectVideos = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    try {
        let existingProject = await VendorProject.findOne({ vendor_id: id });
        if (!existingProject) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor Doesnot have any projects",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "project fetched successfully",
            photos: existingProject.videos,
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const deleteProjectAlbums = async (req, res) => {
    const { id } = req.params;

    const { items_to_delete } = req.body;

    if (!items_to_delete || items_to_delete.length === 0) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide items_to_delete in body",
        });
    }

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    try {
        let existingProject = await VendorProject.findOne({ vendor_id: id });
        if (!existingProject) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor Doesnot have any projects",
            });
        }

        const deleteFile = (filePath) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                }
            });
        };

        items_to_delete.forEach((album_id) => {
            const albumIndex = existingProject.albums.findIndex(
                (album) => album._id.toString() === album_id
            );
            if (albumIndex !== -1) {
                const album = existingProject.albums[albumIndex];
                album.photos.forEach((photo) => {
                    deleteFile(photo);
                });
                existingProject.albums.splice(albumIndex, 1);
            }
        });

        await existingProject.save();

        res.status(201).json({
            message: "Album and its photos deleted successfully",
            success: true,
            status: 201,
        });
    } catch (error) {
        console.error("Error deleting project videos:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const addAlbumPhotos = async (req, res) => {
    const { id } = req.params;

    const { album_id } = req.body;

    if (!album_id || album_id.trim() === "") {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide album_id in body",
        });
    }

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    try {
        let existingProject = await VendorProject.findOne({ vendor_id: id });
        if (!existingProject) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor Doesnot have any projects",
            });
        }

        const albumIndex = existingProject.albums.findIndex(
            (album) => album._id.toString() === album_id
        );

        if (albumIndex === -1) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Album not found",
            });
        }

        const photos = req.files["photos"].map((file) => file.path);

        existingProject.albums[albumIndex].photos =
            existingProject.albums[albumIndex].photos.concat(photos);

        await existingProject.save();

        res.status(201).json({
            message: "photos added successfully",
            success: true,
            status: 201,
        });
    } catch (error) {
        console.error("Error adding album photos:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const deleteAlbumPhotos = async (req, res) => {
    const { id } = req.params;

    const { album_id, items_to_delete } = req.body;

    if (!album_id || album_id.trim() === "") {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide album_id in body",
        });
    }

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    if (!items_to_delete || items_to_delete.length === 0) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide items_to_delete in body",
        });
    }

    try {
        let existingProject = await VendorProject.findOne({ vendor_id: id });
        if (!existingProject) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor Doesnot have any projects",
            });
        }

        const albumIndex = existingProject.albums.findIndex(
            (album) => album._id.toString() === album_id
        );

        if (albumIndex === -1) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Album not found",
            });
        }

        const deleteFile = (filePath) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                }
            });
        };

        existingProject.albums[albumIndex].photos = existingProject.albums[
            albumIndex
        ].photos.filter((photo) => !items_to_delete.includes(photo));

        items_to_delete.forEach((filePath) => {
            deleteFile(filePath);
        });

        await existingProject.save();

        res.status(200).json({
            message: "Photos deleted successfully",
            success: true,
            status: 200,
        });
    } catch (error) {
        console.error("Error adding album photos:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const deleteProjectVideos = async (req, res) => {
    const { id } = req.params;

    const { items_to_delete } = req.body;

    if (!items_to_delete || items_to_delete.length === 0) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide items_to_delete in body",
        });
    }

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    try {
        let existingProject = await VendorProject.findOne({ vendor_id: id });
        if (!existingProject) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor Doesnot have any projects",
            });
        }

        const updatedPhotosList = existingProject.videos.filter(
            (el) => !items_to_delete.includes(el)
        );

        existingProject.videos = updatedPhotosList;
        await existingProject.save();

        res.status(201).json({
            message: "items deleted successfully",
            success: true,
            status: 201,
        });
    } catch (error) {
        console.error("Error deleting project videos:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getVendorProject = async (req, res) => {
    const { vendor_id } = req.query;

    if (!vendor_id || vendor_id.trim() === "") {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "vendor_id is required",
        });
    }

    try {
        const existingProject = await VendorProject.findOne({
            vendor_id: vendor_id,
        });

        if (!existingProject) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "project not found",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "project fetched successfully",
            project: existingProject,
        });
    } catch (error) {
        console.log("error fetching project: ", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
        });
    }
};
// FOR VENDOR CATEGORY - VENUE

// MENU
const addMenu = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    const data = req.body;

    if (
        !data.menu_title ||
        !data.menu_type ||
        !data.price_per_plate ||
        !data.veg_starters ||
        !data.veg_main_course ||
        !data.veg_soup_salad ||
        !data.deserts
    ) {
        return res.status(400).json({
            status: 400,
            success: false,
            message:
                "provide menu_title, menu_type, price_per_plate, veg_starters, veg_main_course, veg_soup_salad and deserts",
        });
    }
    if (
        ["Non-Veg Standard", "Non-Veg Premium"].includes(data.menu_type) &&
        (!data.nonveg_starters ||
            !data.nonveg_main_course ||
            !data.nonveg_soup_salad ||
            !data.live_counters)
    ) {
        return res.status(400).json({
            status: 400,
            success: false,
            message:
                "provide nonveg_starters, nonveg_main_course, nonveg_soup_salad and live_counters",
        });
    }

    try {
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "vendor not found",
            });
        }

        const menuItem = await VenueMenu.create({ vendor_id: id, ...data });
        await menuItem.save();

        return res.status(201).json({
            status: 201,
            success: true,
            message: "menu created.",
            menu: menuItem,
        });
    } catch (error) {
        console.error("Error adding menu item:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getMenus = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    try {
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "vendor not found",
            });
        }

        const menu = await VenueMenu.find({ vendor_id: id });

        return res.status(200).json({
            status: 200,
            success: true,
            message: "menu fetched successfully",
            menu: menu,
        });
    } catch (error) {
        console.error("Error getting menu items: ", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getMenuById = async (req, res) => {
    const { vendor_id, menu_id } = req.query;

    if (!vendor_id || !menu_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id and menu_id in query",
        });
    }

    try {
        const vendor = await Vendor.findById(vendor_id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "vendor not found",
            });
        }

        const menu = await VenueMenu.findById(menu_id);

        return res.status(200).json({
            status: 200,
            success: true,
            message: "menu fetched successfully",
            menu: menu,
        });
    } catch (error) {
        console.error("Error getting menu: ", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const deleteMenu = async (req, res) => {
    const { id } = req.params;

    const { menu_id } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    if (!menu_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide menu_id",
        });
    }

    try {
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor not found",
            });
        }

        const menuItem = await VenueMenu.findByIdAndDelete(menu_id);

        if (!menuItem) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Menu Item not found",
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: "menu item deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting menu item:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const updateMenu = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide vendor_id in params",
        });
    }

    if (
        !data.menu_id ||
        !data.menu_title ||
        !data.menu_type ||
        !data.price_per_plate ||
        !data.veg_starters ||
        !data.veg_main_course ||
        !data.veg_soup_salad ||
        !data.deserts
    ) {
        return res.status(400).json({
            status: 400,
            success: false,
            message:
                "Provide menu_id, menu_title, menu_type, price_per_plate, veg_starters, veg_main_course, veg_soup_salad, and deserts",
        });
    }

    if (
        ["Non-Veg Standard", "Non-Veg Premium"].includes(data.menu_type) &&
        (!data.nonveg_starters ||
            !data.nonveg_main_course ||
            !data.nonveg_soup_salad ||
            !data.live_counters)
    ) {
        return res.status(400).json({
            status: 400,
            success: false,
            message:
                "Provide nonveg_starters, nonveg_main_course, nonveg_soup_salad, and live_counters",
        });
    }

    try {
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor not found",
            });
        }

        const menuItem = await VenueMenu.findById(data.menu_id);

        if (!menuItem) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Menu item not found",
            });
        }

        menuItem.menu_title = data.menu_title;
        menuItem.menu_type = data.menu_type;
        menuItem.price_per_plate = data.price_per_plate;
        menuItem.veg_starters = data.veg_starters;
        menuItem.veg_main_course = data.veg_main_course;
        menuItem.veg_soup_salad = data.veg_soup_salad;
        menuItem.deserts = data.deserts;

        if (["Non-Veg Standard", "Non-Veg Premium"].includes(data.menu_type)) {
            menuItem.nonveg_starters = data.nonveg_starters;
            menuItem.nonveg_main_course = data.nonveg_main_course;
            menuItem.nonveg_soup_salad = data.nonveg_soup_salad;
            menuItem.live_counters = data.live_counters;
        }

        await menuItem.save();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Menu item updated successfully",
        });
    } catch (error) {
        console.error("Error updating menu item:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

// BANQUETS
const addBanquet = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide vendor_id in params",
        });
    }

    const {
        property_name,
        parking_capacity,
        banquet_type,
        guest_count,
        room_count,
        price_per_room,
        space,
        veg_price,
        nonveg_price,
        pincode,
        state,
        city,
        address,
        available_spaces,
    } = req.body;

    const cover_photo = req.files["cover_photo"][0].path;
    const additional_photos = req.files["additional_photos"].map(
        (file) => file.path
    );

    if (!cover_photo || !additional_photos) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide cover_photo and additional_photos",
        });
    }

    if (additional_photos.length < 2) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide atleast 2 additional_photos",
        });
    }

    try {
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor not found",
            });
        }

        const newVenueBanquet = new VenueBanquet({
            vendor_id: id,
            property_name,
            parking_capacity,
            banquet_type,
            guest_count,
            room_count,
            price_per_room,
            space,
            veg_price,
            nonveg_price,
            pincode,
            state,
            city,
            address,
            cover_photo,
            additional_photos,
            available_spaces: JSON.parse(available_spaces),
        });

        await newVenueBanquet.save();

        return res.status(201).json({
            status: 201,
            success: true,
            message: "Banquet Created Successfully",
        });
    } catch (error) {
        console.error("Error adding banquet:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getBanquets = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide vendor_id in params",
        });
    }

    try {
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor not found",
            });
        }

        const banquets = await VenueBanquet.find({ vendor_id: id });

        if (!banquets) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Banquets not found",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "banquets fetched successfully",
            banquets: banquets,
        });
    } catch (error) {
        console.error("Error adding banquet:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getBanquetById = async (req, res) => {
    const { banquet_id } = req.query;

    if (!banquet_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide banquet_id in query",
        });
    }

    try {
        const banquet = await VenueBanquet.findById(banquet_id);

        if (!banquet) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Banquets not found",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "banquet fetched successfully",
            banquet: banquet,
        });
    } catch (error) {
        console.error("Error adding banquet:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const deleteBanquet = async (req, res) => {
    const { id } = req.params;

    const { banquet_id } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide vendor_id in params",
        });
    }

    if (!banquet_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide banquet_id",
        });
    }

    try {
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor not found",
            });
        }

        const banquet = await VenueBanquet.findById(banquet_id);

        if (!banquet) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Banquets not found",
            });
        }

        const deleteFile = (filePath) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                }
            });
        };

        // Delete cover photo
        if (banquet.cover_photo) {
            deleteFile(banquet.cover_photo);
        }

        // Delete additional photos
        if (banquet.additional_photos && banquet.additional_photos.length > 0) {
            banquet.additional_photos.forEach((photo) => deleteFile(photo));
        }

        // Delete the banquet document
        await VenueBanquet.findByIdAndDelete(banquet_id);

        res.status(200).json({
            status: 200,
            success: true,
            message: "Banquet and its images deleted successfully",
        });
    } catch (error) {
        console.error("Error adding banquet:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const updateBanquet = async (req, res) => {
    const { id } = req.params;
    const {
        banquet_id,
        property_name,
        parking_capacity,
        banquet_type,
        guest_count,
        room_count,
        price_per_room,
        space,
        veg_price,
        nonveg_price,
        pincode,
        state,
        city,
        address,
        cover_photo,
        additional_photos,
        available_spaces,
    } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in params",
        });
    }

    try {
        const vendor = await Vendor.findById(id);

        if (!vendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor not found",
            });
        }

        const existingBanquet = await VenueBanquet.findById(banquet_id);
        if (!existingBanquet) {
            return res.status(404).json({
                success: false,
                message: "Banquet not found",
            });
        }

        let coverPhoto = cover_photo;
        let additionalPhotos = additional_photos || [];

        const deleteFile = (filePath) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                }
            });
        };

        if (!cover_photo) {
            deleteFile(existingBanquet.cover_photo);
        }

        if (!additional_photos) {
            existingBanquet.additional_photos.forEach((filepath) => {
                deleteFile(filepath);
            });
        } else {
            const filesToDelete = existingBanquet.additional_photos.filter(
                (photo) => !additional_photos.includes(photo)
            );

            filesToDelete.forEach((filePath) => {
                deleteFile(filePath);
            });
        }

        if (
            req.files["updated_cover_photo"] &&
            req.files["updated_cover_photo"].length > 0
        ) {
            coverPhoto = req.files["updated_cover_photo"][0].path;
        }

        if (
            req.files["updated_additional_photos"] &&
            req.files["updated_additional_photos"].length > 0
        ) {
            additionalPhotos = additionalPhotos.concat(
                req.files["updated_additional_photos"].map((file) => file.path)
            );
        }

        existingBanquet.property_name = property_name;
        existingBanquet.parking_capacity = parking_capacity;
        existingBanquet.banquet_type = banquet_type;
        existingBanquet.guest_count = guest_count;
        existingBanquet.room_count = room_count;
        existingBanquet.price_per_room = price_per_room;
        existingBanquet.space = space;
        existingBanquet.veg_price = veg_price;
        existingBanquet.nonveg_price = nonveg_price;
        existingBanquet.pincode = pincode;
        existingBanquet.state = state;
        existingBanquet.city = city;
        existingBanquet.address = address;
        existingBanquet.cover_photo = coverPhoto;
        existingBanquet.additional_photos = additionalPhotos;
        existingBanquet.available_spaces = JSON.parse(available_spaces);

        await existingBanquet.save();

        return res.status(200).json({
            success: true,
            message: "Banquet updated successfully",
        });
    } catch (error) {
        console.error("Error updating banquet:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getAllBanquets = async (req, res) => {
    const { page } = req.query || 0;

    if (!page || page.trim() === "") {
    }

    try {
        const banquets = await VenueBanquet.find();

        return res.status(200).json({
            status: 200,
            success: true,
            message: "banquets fetched successfully",
            banquets: banquets,
        });
    } catch (error) {
        console.error("Error adding banquet:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const banquetsPagination = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const guest_count = req.query.guest_count || "";
    const room_count = req.query.room_count || "";
    const plate_price = req.query.plate_price || "";
    const venue_type = req.query.venue_type || "";
    const space_type = req.query.space || "";

    const startIndex = (page - 1) * limit;

    const filter = {};

    if (guest_count) {
        const [min, max] = guest_count.split("-");
        if (max) {
            filter.guest_count = {
                ...{ $gte: parseInt(min) },
                ...{ $lte: parseInt(max) },
            };
        } else {
            if (min[0] === "<") {
                filter.guest_count = {
                    ...{ $lt: parseInt(min.replace("<", "")) },
                };
            } else {
                filter.guest_count = {
                    ...{ $gt: parseInt(min.replace(">", "")) },
                };
            }
        }
    }

    if (room_count) {
        const [min, max] = room_count.split("-");
        if (max) {
            filter.room_count = {
                ...{ $gte: parseInt(min) },
                ...{ $lte: parseInt(max) },
            };
        } else {
            if (min[0] === "<") {
                filter.room_count = {
                    ...{ $lt: parseInt(min.replace("<", "")) },
                };
            } else {
                filter.room_count = {
                    ...{ $gt: parseInt(min.replace(">", "")) },
                };
            }
        }
    }

    if (plate_price) {
        const [min, max] = plate_price.split("-");
        if (max) {
            filter.veg_price = {
                ...{ $gte: parseInt(min) },
                ...{ $lte: parseInt(max) },
            };
        } else {
            if (min[0] === "<") {
                filter.veg_price = {
                    ...{ $lt: parseInt(min.replace("<", "")) },
                };
            } else {
                filter.veg_price = {
                    ...{ $gt: parseInt(min.replace(">", "")) },
                };
            }
        }
    }

    if (venue_type) {
        filter.banquet_type = venue_type;
    }

    if (space_type) {
        filter["available_spaces.space_type"] = space_type;
    }

    try {
        const banquets = await VenueBanquet.find(filter)
            .limit(limit)
            .skip(startIndex)
            .exec();
        const count = await VenueBanquet.countDocuments(filter);

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Fetched banquets successfully",
            data: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(count / limit),
                totalCount: count,
                banquets: banquets,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal server error",
        });
    }
};

// FOR VENDOR CATEGORY - PHOTOGRAPHY

const addPhotographyServices = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    let arrayData = Object.keys(data).map((key) => [key, data[key]]);
    arrayData = arrayData.filter((item) => item[0] !== "decoded");

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide vendor_id in params",
        });
    }

    try {
        const existingVendorService = await PhotographerServices.findOne({
            vendor_id: id,
        });

        if (!existingVendorService) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Service not found",
            });
        }

        for (let item of arrayData) {
            existingVendorService[item[0]] = item[1];
        }
        await existingVendorService.save();

        return res.status(201).json({
            message: "service added successfully",
            success: true,
            status: 201,
        });
    } catch (error) {
        console.error("Error adding service:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getPhotographyServices = async (req, res) => {
    const { vendor_id } = req.query;

    if (!vendor_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide vendor_id and service_id in query",
        });
    }

    try {
        const existingVendorService = await PhotographerServices.findOne({
            vendor_id: vendor_id,
        });

        if (!existingVendorService) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Service not found",
            });
        }

        return res.status(200).json({
            message: "services fetched successfully",
            success: true,
            status: 200,
            services: existingVendorService,
        });
    } catch (error) {
        console.error("Error fetching service:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

// FOR MEMBERDHIP PLANS
const getUserMembershipPlan = async (req, res) => {
    const { vendor_id } = req.query;

    if (!vendor_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor_id in request query",
        });
    }

    try {
        const existingBooking = await Booking.findOne({ vendor_id: vendor_id });

        if (!existingBooking) {
            return res.status(404).json({
                message: "No Bookings found.",
                success: false,
                status: 404,
            });
        }

        const bookingDate = new Date(existingBooking.createdAt);
        const lastDate = new Date(bookingDate);
        lastDate.setDate(bookingDate.getDate() + existingBooking.plan_days);

        const currentDate = new Date();
        const daysRemaining = Math.floor(
            (lastDate - currentDate) / (1000 * 60 * 60 * 24)
        );

        if (daysRemaining <= 0) {
            return res.status(401).json({
                status: 401,
                success: false,
                message: "Package Expired",
            });
        }

        const existingMembership = await MembershipPlan.findById(
            existingBooking.membership_id
        );

        return res.status(200).json({
            status: 200,
            success: true,
            data: {
                membership: existingMembership,
                booking: existingBooking,
                days_remaining: daysRemaining,
            },
        });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

export {
    registerVendor,
    loginVendor,
    getVendorCategory,
    updateVendor,
    VendorPagination,
    updateAdditionalDetails,
    addMenu,
    getMenus,
    deleteMenu,
    updateMenu,
    addBanquet,
    getBanquets,
    getAllBanquets,
    banquetsPagination,
    getBanquetById,
    deleteBanquet,
    updateBanquet,
    addProjectAlbum,
    addProjectVideo,
    getProjectAlbums,
    getProjectVideos,
    deleteProjectVideos,
    deleteProjectAlbums,
    addAlbumPhotos,
    getAlbumById,
    deleteAlbumPhotos,
    getMenuById,
    addPhotographyServices,
    getPhotographyServices,
    getVendorById,
    getVendorProject,
    getVendorsByCategory,
    getUserMembershipPlan,
};
