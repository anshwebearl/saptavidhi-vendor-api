import mongoose, { Schema } from "mongoose";

const MembershipPlanSchema = new Schema(
    {
        membership_category: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        plan_days: {
            type: Number,
            required: true,
        },
        features: {
            type: [
                {
                    _id: Schema.Types.ObjectId,
                    name: String,
                },
            ],
            required: true,
            default: [],
        },
    },
    { timestamps: true }
);

export const MembershipPlan = mongoose.model(
    "MembershipPlan",
    MembershipPlanSchema
);
