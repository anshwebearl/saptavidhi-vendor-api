import { Vendor } from "../models/vendor.model.js";
import jwt from "jsonwebtoken";

const generateToken = async (id) => {
    try {
        const vendor = await Vendor.findById(id);
        const token = jwt.sign({ _id: id }, process.env.JWT_TOKEN_SECRET, {
            expiresIn: process.env.JWT_TOKEN_EXPIRY,
        });
        return token;
    } catch (error) {
        console.log("error in generating token: ",error);
    }
};

export default generateToken;
