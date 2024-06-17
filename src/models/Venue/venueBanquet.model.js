import mongoose, { Schema } from "mongoose";

const VenueBanquetSchema = new Schema(
    {
        vendor_id: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        banquet_type: {
            type: String,
            enum: [
                "Indoor",
                "Outdoor",
                "Poolside",
                "Indoor & Outdoor",
                "Terrace",
            ],
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
        fixed_capacity: {
            type: Number,
            required: true,
        },
        max_capacity: {
            type: Number,
            required: true,
        },
        cover_photo: {
            type: String,
        },
        additional_photos: {
            type: [String],
        },
    },
    { timestamps: true }
);

export const VenueBanquet = mongoose.model("VenueBanquet", VenueBanquetSchema);
