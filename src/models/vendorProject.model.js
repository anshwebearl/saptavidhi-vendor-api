import mongoose, { Schema } from "mongoose";

const VendorProjectSchema = new Schema(
    {
        vendor_id: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        albums: {
            type: [
                {
                    _id: {
                        type: Schema.Types.ObjectId,
                        auto: true,
                    },
                    album_title: {
                        type: String,
                    },
                    photos: {
                        type: [String],
                        default: [],
                    },
                },
            ],
            default: [],
        },
        videos: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export const VendorProject = mongoose.model(
    "VendorProject",
    VendorProjectSchema
);
