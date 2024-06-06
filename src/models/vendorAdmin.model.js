import mongoose, { Schema } from "mongoose";

const vendorAdminSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
},{timestamps:true});

export const VendorAdmin = mongoose.model("VendorAdmin", vendorAdminSchema);
