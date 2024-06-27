import mongoose, { Schema } from "mongoose";

const VenueBanquetSchema = new Schema(
    {
        vendor_id: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        property_name: {
            type: String,
            required: true,
        },
        parking_capacity: {
            type: Number,
            required: true,
        },
        // catering_policy: {
        //     type: String,
        //     required: true,
        // },
        // decor_policy: {
        //     type: String,
        //     required: true,
        // },
        // dj_policy: {
        //     type: String,
        //     required: true,
        // },
        banquet_type: {
            type: String,
            enum: [
                "4 Star & Above Wedding Hotels",
                "Banquet Halls",
                "Lawns / Farmhouses",
                "3 Star Hotels with Banquets",
                "Country / Golf Club",
                "Wedding Resorts",
                "Party Restaurants / Lounge Bars",
                "Forts / Palaces For Wedding",
                "Destination Wedding Venues",
                "Kalyana Mandapams",
                "Small Function / Party Halls",
                "Venues With Rooms",
                "5 Star Luxury Wedding Hotels",
                "Temple Wedding Venues",
                "Convention / Function Halls",
            ],
            required: true,
        },
        guest_count: {
            type: Number,
            required: true,
        },
        room_count: {
            type: Number,
            required: true,
        },
        // banquet_type: {
        //     type: String,
        //     enum: [
        //         "Indoor",
        //         "Outdoor",
        //         "Poolside",
        //         "Indoor & Outdoor",
        //         "Terrace",
        //     ],
        //     required: true,
        // },
        price_per_room: {
            type: Number,
            required: true,
        },
        space: {
            type: Number,
            required: true,
        },
        veg_price: {
            type: Number,
            required: true,
        },
        nonveg_price: {
            type: Number,
            required: true,
        },
        pincode: {
            type: Number,
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
        // fixed_capacity: {
        //     type: Number,
        //     required: true,
        // },
        // max_capacity: {
        //     type: Number,
        //     required: true,
        // },
        cover_photo: {
            type: String,
        },
        additional_photos: {
            type: [String],
        },
        address: {
            type: String,
            required: true,
        },
        available_spaces: {
            type: [
                {
                    space_name: {
                        type: String,
                        required: true,
                    },
                    space_type: {
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
                    fixed_capacity: {
                        type: Number,
                        required: true,
                    },
                    max_capacity: {
                        type: Number,
                        required: true,
                    },
                },
            ],
        },
    },
    { timestamps: true }
);

export const VenueBanquet = mongoose.model("VenueBanquet", VenueBanquetSchema);
