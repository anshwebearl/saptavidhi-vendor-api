import { Vendor } from "../models/vendor.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { VendorCategory } from "../models/vendorCategory.model.js";

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

        console.log(additional_details);

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

const getVendorDetails = async (req, res) => {
    const { _id } = req.body.decoded;

    const vendor = await Vendor.findById({ _id }).select("-password");

    if (!vendor) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: "vendor does not exists",
        });
    }

    return res.status(200).json({
        success: true,
        status: 200,
        vendor: vendor,
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

// const getVendorAdditionalDetails = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const vendor
//     } catch (error) {
//         console.error("Error fetching additional details:", error);
//         res.status(500).json({
//             message: "Internal server error",
//             success: false,
//             status: 500,
//         });
//     }
// };

export {
    registerVendor,
    loginVendor,
    getVendorDetails,
    updateVendor,
    updateAdditionalDetails,
};
