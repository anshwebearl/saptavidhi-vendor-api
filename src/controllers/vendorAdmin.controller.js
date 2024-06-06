import { VendorAdmin } from "../models/vendorAdmin.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { Vendor } from "../models/vendor.model.js";

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
    const { current_password, new_password } = req.body;
    const { id } = req.params;

    if ([current_password, new_password].some((x) => x === "")) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: "all fields are compulsory",
        });
    }

    const existingVendorAdmin = await VendorAdmin.findById({ _id: id });
    if (!existingVendorAdmin) {
        return res.status(404).json({
            success: false,
            status: 404,
            message: "admin not registered",
        });
    }

    await bcrypt.compare(
        current_password,
        existingVendorAdmin.password,
        async (err, data) => {
            if (err) {
                console.log("error in bcrypt compare: ", err);
                return res.status(500);
            }
            if (data) {
                const newHashedPassword = await bcrypt.hash(new_password, 10);
                existingVendorAdmin.password = newHashedPassword;

                await existingVendorAdmin.save();

                return res.status(200).json({
                    success: true,
                    status: 200,
                    message: "Password updated successfully",
                });
            } else {
                return res.status(401).json({
                    success: false,
                    status: 401,
                    message: "Invalid Current Password",
                });
            }
        }
    );
};

const getVendors = async (req, res) => {
    const { id } = req.params;

    let vendor;

    if (!id) {
        vendor = await Vendor.find();
    } else {
        vendor = await Vendor.findById({ _id: id }).select("-password");
    }

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

export {
    // registerVendorAdmin,
    changeAdminPassword,
    loginVendorAdmin,
    getVendors,
};
