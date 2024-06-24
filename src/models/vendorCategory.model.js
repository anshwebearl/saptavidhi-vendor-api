import mongoose, { Schema } from "mongoose";

const subCategorySchema = new Schema(
    {
        subCategoryName: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const propertySchema = new Schema(
    {
        propertyName: {
            type: String,
            required: true,
        },
        propertyDescription: {
            type: String,
            required: true,
        },
        propertyType: {
            type: String,
            enum: [
                "textInput",
                "radioButton",
                "multiSelect",
                "textArea",
                "numeric",
                "multiSelectWithText",
            ],
            required: true,
        },
        inputs: {
            type: [String],
        },
        multiSelectWithTextInputs: {
            type: [
                {
                    subInputVariable: {
                        type: String,
                        required: true,
                    },
                    subInputName: {
                        type: String,
                        required: true,
                    },
                    subPropertyDescription: {
                        type: String,
                        required: true,
                    },
                },
            ],
            default: [],
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
