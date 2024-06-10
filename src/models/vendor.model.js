import mongoose, { Schema } from "mongoose";

const vendorSchema = new Schema(
    {
        brand_name: {
            type: String,
            required: true,
        },
        contact_person_name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        pincode: {
            type: Number,
            required: true,
        },
        mobile_number: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },
        address: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        vendor_type: {
            type: Schema.Types.ObjectId,
            ref: "VendorCategory",
            required: true,
        },
        additional_details: {
            type: Schema.Types.Array,
            required: true,
            default: {},
        },
        domain: {
            type: String,
            required: false,
        },
        additional_email: {
            type: String,
            required: false,
        },
        website_link: {
            type: String,
            required: false,
        },
        facebook_url: {
            type: String,
            required: false,
        },
        instagram_url: {
            type: String,
            required: false,
        },
        additional_info: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            default: "pending",
        },
    },
    { timestamps: true }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);
