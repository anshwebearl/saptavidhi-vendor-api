import mongoose, { Schema } from "mongoose";

const PhotographerServicesSchema = new Schema(
    {
        vendor_id: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        candidPhotography: {
            type: Number,
            default: 0,
        },
        weddingFilms: {
            type: Number,
            default: 0,
        },
        tradionalPhotography: {
            type: Number,
            default: 0,
        },
        preWeddingShoots: {
            type: Number,
            default: 0,
        },
        albums: {
            type: Number,
            default: 0,
        },
        maternityShoots: {
            type: Number,
            default: 0,
        },
        fashionShoots: {
            type: Number,
            default: 0,
        },
        preWeddingFilms: {
            type: Number,
            default: 0,
        },
        tradionalVideography: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const PhotographerServices = mongoose.model(
    "PhotographerServices",
    PhotographerServicesSchema
);
