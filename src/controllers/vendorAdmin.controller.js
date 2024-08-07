import { VendorAdmin } from "../models/vendorAdmin.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { Vendor } from "../models/vendor.model.js";
import { VendorCategory } from "../models/vendorCategory.model.js";
import mongoose from "mongoose";
import { VenueMenu } from "../models/Venue/venueMenu.model.js";
import { VenueBanquet } from "../models/Venue/venueBanquet.model.js";
import { MembershipPlan } from "../models/membershipPlans.models.js";

// const registerVendorAdmin = async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         if ([username, password].some((x) => x === "")) {
//             return res.status(400).json({
//                 success: false,
//                 status: 400,
//                 message: "all fields are compulsory",
//             });
//         }

//         const existingVendorAdmin = await VendorAdmin.findOne({ username });

//         if (existingVendorAdmin) {
//             return res.status(409).json({
//                 success: false,
//                 status: 409,
//                 message: "admin with the given username already exists",
//             });
//         }

//         const encryptedPassword = await bcrypt.hash(password, 10);
//         const vendorAdmin = await VendorAdmin.create({
//             username,
//             password: encryptedPassword,
//         });

//         const token = await generateToken(vendorAdmin._id);
//         return res
//             .status(201)
//             .cookie("token", token, { httpOnly: true, secure: true })
//             .json({
//                 token: token,
//                 status: 201,
//                 success: true,
//             });
//     } catch (error) {
//         return res.status(404).json({
//             status: 404,
//             success: false,
//             message: error,
//         });
//     }
// };

const loginVendorAdmin = async (req, res) => {
    const { username, password } = req.body;

    if ([username, password].some((x) => x === "")) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: "all fields are compulsory",
        });
    }

    const existingVendorAdmin = await VendorAdmin.findOne({ username });
    if (!existingVendorAdmin) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: "admin not registered",
        });
    }

    await bcrypt.compare(
        password,
        existingVendorAdmin.password,
        async (err, data) => {
            if (err) {
                console.log("error in bcrypt compare: ", err);
                return res.status(500);
            }
            if (data) {
                const token = await generateToken(existingVendorAdmin._id);
                res.cookie("token", token, {
                    maxAge: 86400 * 1000,
                    httpOnly: true,
                });
                return res.status(200).json({
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

const changeAdminPassword = async (req, res) => {
    const { new_password } = req.body;
    const { id } = req.params;

    if (new_password === "") {
        return res.status(400).json({
            success: false,
            status: 400,
            message: "New password is required",
        });
    }
    try {
        const existingVendorAdmin = await VendorAdmin.findById({ _id: id });
        if (!existingVendorAdmin) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Admin not found",
            });
        }

        const newHashedPassword = await bcrypt.hash(new_password, 10);
        existingVendorAdmin.password = newHashedPassword;
        await existingVendorAdmin.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("Error changing admin password:", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        });
    }
};

const getVendors = async (req, res) => {
    try {
        const { id } = req.params;

        const pipeline = [
            {
                $lookup: {
                    from: "vendorcategories",
                    localField: "vendor_type",
                    foreignField: "_id",
                    as: "vendorCategory",
                },
            },
            {
                $unwind: "$vendorCategory",
            },
        ];

        if (id) {
            pipeline.unshift({
                $match: { _id: new mongoose.Types.ObjectId(id) },
            });
        }

        const vendors = await Vendor.aggregate(pipeline);

        if (!vendors || vendors.length === 0) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Vendor does not exist",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            vendor: vendors,
        });
    } catch (error) {
        console.error("Error retrieving vendors:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getAdmin = async (req, res) => {
    const { _id } = req.body.decoded;

    try {
        const existingVendorAdmin = await VendorAdmin.findById({
            _id: _id,
        }).select("-password");
        if (!existingVendorAdmin) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Admin not found",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "admin fetched successfully",
            admin: existingVendorAdmin,
        });
    } catch (error) {
        console.error("Error in fetching Admin:", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        });
    }
};

const changeVendorStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const existingVendor = await Vendor.findById({ _id: id });
        if (!existingVendor) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "vendor does not exist",
            });
        }

        existingVendor.status = status;
        await existingVendor.save();
        return res.status(201).json({
            success: true,
            status: 201,
            message: "status changed successfully",
        });
    } catch (error) {
        console.log("error in changing vendor status: ", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "internal server error",
        });
    }
};

const createVendorCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Please provide categoryName",
            });
        }

        const existingCategory = await VendorCategory.findOne({
            name: categoryName,
        });

        if (existingCategory) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Category already exists",
            });
        }

        const newCategory = new VendorCategory({ name: categoryName });

        await newCategory.save();

        res.status(201).json({
            status: 201,
            success: true,
            message: "Category created successfully",
            category: newCategory,
        });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const updateVendorCategory = async (req, res) => {
    const { id } = req.params;
    const { updatedCategoryName } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Please provide id",
        });
    }

    if (!updatedCategoryName) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Please provide updatedCategoryName",
        });
    }

    try {
        const vendorCategory = await VendorCategory.findById(id);

        if (!vendorCategory) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "vendor category doesnt exist",
            });
        }

        vendorCategory.name = updatedCategoryName;
        await vendorCategory.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: "vendor name updated successfully",
        });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const deleteVendorCategory = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Please provide id",
        });
    }

    try {
        const vendorCategory = await VendorCategory.findByIdAndDelete(id);

        if (!vendorCategory) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "no vendor found",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Vendor category deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const createVendorSubCategory = async (req, res) => {
    const { id } = req.params;
    const { subCategoryName } = req.body;

    if (!subCategoryName) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Please provide categoryName and subCategoryName",
        });
    }
    try {
        const category = await VendorCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Category not found",
            });
        }

        const existingSubCategory = category.subCategoryList.find(
            (sub) => sub.subCategoryName === subCategoryName
        );
        if (existingSubCategory) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Subcategory already exists for this category",
            });
        }

        category.subCategoryList.push({ subCategoryName });

        await category.save();

        res.status(201).json({
            status: 201,
            success: true,
            message: "Subcategory created successfully",
            category,
        });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const deleteVendorSubCategory = async (req, res) => {
    const { id } = req.params;
    const { subcategoryId } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor category id in params",
        });
    }

    if (!subcategoryId) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Please provide subcategory ID in body",
        });
    }

    try {
        const vendorCategory = await VendorCategory.findById(id);
        if (!vendorCategory) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor category not found",
            });
        }

        const subCategoryIndex = vendorCategory.subCategoryList.findIndex(
            (sub) => sub._id.toString() === subcategoryId
        );

        if (subCategoryIndex === -1) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Subcategory not found",
            });
        }

        vendorCategory.subCategoryList.splice(subCategoryIndex, 1);

        await vendorCategory.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Subcategory deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const updateVendorSubCategory = async (req, res) => {
    const { id } = req.params;
    const { subcategoryId, subCategoryName } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor category id in params",
        });
    }

    if (!subcategoryId || !subCategoryName) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "subcategoryId and subCategoryName is required",
        });
    }

    try {
        const vendorCategory = await VendorCategory.findById(id);
        if (!vendorCategory) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor category not found",
            });
        }

        const subCategoryIndex = vendorCategory.subCategoryList.findIndex(
            (sub) => sub._id.toString() === subcategoryId
        );

        if (subCategoryIndex === -1) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Subcategory not found",
            });
        }

        vendorCategory.subCategoryList[subCategoryIndex].subCategoryName =
            subCategoryName;

        await vendorCategory.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Subcategory updated successfully",
        });
    } catch (error) {
        console.error("Error updating subcategory:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const createVendorProperty = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide vendor category id in params",
        });
    }

    try {
        const {
            propertyName,
            propertyDescription,
            propertyType,
            inputs,
            multiSelectWithTextInputs,
        } = req.body;

        if (!propertyName || !propertyDescription || !propertyType) {
            return res.status(400).json({
                status: 400,
                success: false,
                message:
                    "Please provide propertyName, propertyDescription, and propertyType",
            });
        }

        if (
            (propertyType === "radioButton" ||
                propertyType === "multiSelect") &&
            (!inputs || inputs.length === 0)
        ) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Please provide inputs",
            });
        }

        if (
            propertyType === "multiSelectWithText" &&
            (!multiSelectWithTextInputs ||
                multiSelectWithTextInputs.length === 0)
        ) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Please provide multiSelectWithTextInputs",
            });
        }

        const category = await VendorCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Category not found",
            });
        }

        const propertyIndex = category.categoryProperties.findIndex(
            (sub) => sub.propertyName === propertyName
        );

        if (propertyIndex !== -1) {
            return res.status(409).json({
                status: 409,
                success: false,
                message: "Property already exists",
            });
        }

        category.categoryProperties.push({
            propertyName,
            propertyDescription,
            propertyType,
            inputs,
            multiSelectWithTextInputs,
        });
        await category.save();

        const savedProperty = category.categoryProperties.find(
            (sub) => sub.propertyName === propertyName
        );
        const propertyId = savedProperty._id;

        const vendors = await Vendor.find({ vendor_type: id });

        for (let vendor of vendors) {
            vendor.additional_details.push({
                _id: propertyId,
                [propertyName]:
                    propertyType === "multiSelect" ||
                    propertyType === "multiSelectWithText"
                        ? []
                        : "",
            });
            await vendor.save();
        }

        res.status(201).json({
            status: 201,
            success: true,
            message: "Property created successfully",
            category,
        });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const deleteVendorProperty = async (req, res) => {
    const { id } = req.params;
    const { propertyId } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide vendor id in params",
        });
    }

    if (!propertyId) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Please provide propertyId in body",
        });
    }

    try {
        const vendorCategory = await VendorCategory.findById(id);
        if (!vendorCategory) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor category not found",
            });
        }

        const propertyIndex = vendorCategory.categoryProperties.findIndex(
            (sub) => sub._id.toString() === propertyId
        );

        if (propertyIndex === -1) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Property not found",
            });
        }

        vendorCategory.categoryProperties.splice(propertyIndex, 1);

        await vendorCategory.save();

        const vendors = await Vendor.find({ vendor_type: id });

        for (let vendor of vendors) {
            const detailIndex = vendor.additional_details.findIndex(
                (detail) => detail._id == propertyId
            );
            if (detailIndex !== -1) {
                vendor.additional_details.splice(detailIndex, 1);
            }
            await vendor.save();
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "property deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting property:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const updateVendorProperty = async (req, res) => {
    const { id } = req.params;
    const {
        propertyId,
        propertyName,
        propertyDescription,
        propertyType,
        inputs,
        multiSelectWithTextInputs,
    } = req.body;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Provide vendor category id in params",
        });
    }

    if (!propertyId || !propertyName || !propertyDescription || !propertyType) {
        return res.status(400).json({
            status: 400,
            success: false,
            message:
                "propertyId, propertyName, propertyDescription, and propertyType are required",
        });
    }

    if (
        (propertyType === "radioButton" || propertyType === "multiSelect") &&
        (!inputs || inputs.length === 0)
    ) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Please provide inputs",
        });
    }

    if (
        propertyType === "multiSelectWithText" &&
        (!multiSelectWithTextInputs || multiSelectWithTextInputs.length === 0)
    ) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Please provide multiSelectWithTextInputs",
        });
    }

    try {
        const vendorCategory = await VendorCategory.findById(id);
        if (!vendorCategory) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Vendor category not found",
            });
        }

        const propertyIndex = vendorCategory.categoryProperties.findIndex(
            (sub) => sub._id.toString() === propertyId
        );

        if (propertyIndex === -1) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Property not found",
            });
        }

        vendorCategory.categoryProperties[propertyIndex] = {
            _id: propertyId,
            propertyName,
            propertyDescription,
            propertyType,
            inputs,
            multiSelectWithTextInputs,
        };

        await vendorCategory.save();

        const vendors = await Vendor.find({ vendor_type: id });

        for (let vendor of vendors) {
            const detailIndex = vendor.additional_details.findIndex(
                (detail) => detail._id.toString() === propertyId
            );
            if (detailIndex !== -1) {
                const currentDetail = vendor.additional_details[detailIndex];
                const currentValue =
                    currentDetail[
                        Object.keys(currentDetail).find((key) => key !== "_id")
                    ];

                vendor.additional_details[detailIndex] = {
                    _id: propertyId,
                    [propertyName]: currentValue,
                };
                await vendor.save();
            }
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Property updated successfully",
        });
    } catch (error) {
        console.error("Error updating property:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

// MEMBERSHIP PLANS
const addMembershipPlan = async (req, res) => {
    const { membership_category, price, features, plan_days } = req.body;

    if (!membership_category || !price || !features || !plan_days) {
        return res.status(400).json({
            status: 400,
            success: false,
            message:
                "Please provide plan_days, membership_category, price, and features in the request body",
        });
    }

    try {
        const parsedFeatures = features.map((feature) => ({
            _id: new mongoose.Types.ObjectId(),
            name: feature,
        }));

        const membership = await MembershipPlan.create({
            membership_category,
            price,
            plan_days: plan_days,
            features: parsedFeatures,
        });

        return res.status(201).json({
            status: 201,
            message: "Membership added successfully",
            success: true,
            data: membership,
        });
    } catch (error) {
        console.error("Error adding membership plans:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getAllMembershipPlans = async (req, res) => {
    try {
        const membershipPlans = await MembershipPlan.find();
        return res.status(200).json({
            status: 200,
            success: true,
            data: membershipPlans,
        });
    } catch (error) {
        console.log("error fetching membership plans: ", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
        });
    }
};

const deleteMembershipPlan = async (req, res) => {
    const { membership_id } = req.query;

    if (!membership_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide membership_id in request query.",
        });
    }

    try {
        const deletedMembership = await MembershipPlan.findByIdAndDelete(
            membership_id
        );

        if (!deletedMembership) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "membership not found",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "membership deleted successfully",
        });
    } catch (error) {
        console.log("error deleting membership: ", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "internal server error",
        });
    }
};

const getMembershipById = async (req, res) => {
    const { membership_id } = req.query;

    if (!membership_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide membership_id in request query.",
        });
    }

    try {
        const existingMembershipPlan = await MembershipPlan.findById(
            membership_id
        );

        if (!existingMembershipPlan) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "membership not found",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "membership fetched successfully",
            data: existingMembershipPlan,
        });
    } catch (error) {
        console.log("error deleting membership: ", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "internal server error",
        });
    }
};

const updateMembershipPlans = async (req, res) => {
    const { membership_category, price, features, plan_days } = req.body;

    const { membership_id } = req.query;

    if (!membership_category || !price || !features || !plan_days) {
        return res.status(400).json({
            status: 400,
            success: false,
            message:
                "Please provide plan_days, membership_category, price, and features in the request body",
        });
    }

    if (!membership_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Please provide membership_id in the request query",
        });
    }

    try {
        const parsedFeatures = features.map((feature) => ({
            _id: new mongoose.Types.ObjectId(),
            name: feature,
        }));

        const membership = await MembershipPlan.findByIdAndUpdate(
            membership_id,
            {
                $set: {
                    membership_category: membership_category,
                    price: price,
                    features: parsedFeatures,
                    plan_days: plan_days,
                },
            }
        );

        return res.status(201).json({
            status: 201,
            message: "Membership updated successfully",
            success: true,
            data: membership,
        });
    } catch (error) {
        console.error("Error adding membership plans:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

// COMMON FUNCTIONALITY
const getProjects = async (req, res) => {
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
            project: existingProject,
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

// VENUES
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

export {
    // registerVendorAdmin,
    changeAdminPassword,
    loginVendorAdmin,
    getVendors,
    getAdmin,
    changeVendorStatus,
    createVendorCategory,
    createVendorSubCategory,
    createVendorProperty,
    updateVendorCategory,
    deleteVendorCategory,
    deleteVendorSubCategory,
    updateVendorSubCategory,
    deleteVendorProperty,
    updateVendorProperty,
    getMenus,
    getBanquets,
    getProjects,
    addMembershipPlan,
    getAllMembershipPlans,
    deleteMembershipPlan,
    getMembershipById,
    updateMembershipPlans,
};
