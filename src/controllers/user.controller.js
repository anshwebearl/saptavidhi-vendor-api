import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

const registerUser = async (req, res) => {
    const {
        first_name,
        last_name,
        username,
        email,
        mobile_number,
        pincode,
        address,
        state,
        city,
        password,
    } = req.body;

    if (
        [
            first_name,
            last_name,
            username,
            email,
            mobile_number,
            pincode,
            address,
            state,
            city,
            password,
        ].some((x) => x.trim() === "")
    ) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: "all fields are compulsory",
        });
    }

    const parsedMobileNumber = Number(mobile_number);

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { mobile_number: parsedMobileNumber }],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                status: 409,
                message:
                    "user with the given email or mobile number already exists",
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            first_name,
            last_name,
            username,
            email,
            mobile_number: Number(mobile_number),
            pincode: Number(pincode),
            address,
            state,
            city,
            password: encryptedPassword,
        });

        const token = await generateToken(username._id);
        user.password = undefined;
        return res.status(201).json({
            token: token,
            status: 201,
            success: true,
            user: user,
        });
    } catch (error) {
        console.log("error creating user : ", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
        });
    }
};

const loginUser = async (req, res) => {
    const { mobile_number, password } = req.body;

    if (!mobile_number || !password) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "phone and password are required.",
        });
    }

    try {
        const existingUser = await User.findOne({
            mobile_number: mobile_number,
        });

        if (!existingUser) {
            return res.status(404).json({
                status: 404,
                success: true,
                message: "user doesnot exist",
            });
        }

        await bcrypt.compare(
            password,
            existingUser.password,
            async (err, data) => {
                if (err) {
                    console.log("error in bcrypt compare: ", err);
                    return res.status(500);
                }
                if (data) {
                    const token = await generateToken(existingUser._id);
                    existingUser.password = undefined;
                    return res.status(200).json({
                        success: true,
                        status: 200,
                        token: token,
                        user: existingUser,
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
    } catch (error) {
        console.log("error in user login : ", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
        });
    }
};

const getUser = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "user id is required.",
        });
    }

    try {
        const existingUser = await User.findById(id).select("-password");

        if (!existingUser) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User doesnot exist",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            user: existingUser,
        });
    } catch (error) {
        console.log("error fetching user : ", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
        });
    }
};

export { registerUser, loginUser, getUser };
