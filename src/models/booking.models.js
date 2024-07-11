import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema(
    {
        vendor_id: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        transaction_id: {
            type: Schema.Types.ObjectId,
            ref: "Transaction",
            required: true,
        },
        membership_id: {
            type: Schema.Types.ObjectId,
            ref: "MembershipPlan",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        plan_days: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export const Booking = mongoose.model("Booking", BookingSchema);
