import mongoose, { Schema } from "mongoose";

const VenueMenuSchema = new Schema(
    {
        vendor_id: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        menu_title: {
            type: String,
            required: true,
        },
        menu_type: {
            type: String,
            enum: [
                "Veg Standard",
                "Veg Premium",
                "Non-Veg Standard",
                "Non-Veg Premium",
            ],
            required: true,
        },
        price_per_plate: {
            type: Number,
            required: true,
        },
        veg_starters: {
            type: Number,
            required: true,
        },
        veg_main_course: {
            type: Number,
            required: true,
        },

        veg_soup_salad: {
            type: Number,
            required: true,
        },
        deserts: {
            type: Number,
            required: true,
        },
        nonveg_starters: {
            type: Number,
        },
        nonveg_main_course: {
            type: Number,
        },

        nonveg_soup_salad: {
            type: Number,
        },
        live_counters: {
            type: Number,
        },
    },
    { timestamps: true }
);

export const VenueMenu = mongoose.model("VenueMenu", VenueMenuSchema);
