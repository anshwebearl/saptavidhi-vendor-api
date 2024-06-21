import mongoose, { Schema } from "mongoose";

const subCategorySchema = new Schema(
    {
        subCategoryName: {
            type: String,
        },
    },
    { timestamps: true }
);

const propertySchema = new Schema(
    {
        propertyName: {
            type: String,
        },
        propertyDescription: {
            type: String,
        },
        propertyType: {
            type: String,
            enum: ["textInput", "radioButton", "multiSelect"],
        },
        inputs: {
            type: [String],
        },
    },
    { timestamps: true }
);

const vendorCategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        subCategoryList: {
            type: [subCategorySchema],
            default: [],
        },
        categoryProperties: {
            type: [propertySchema],
            default: [],
        },
    },
    { timestamps: true }
);

export const VendorCategory = mongoose.model(
    "VendorCategory",
    vendorCategorySchema
);
