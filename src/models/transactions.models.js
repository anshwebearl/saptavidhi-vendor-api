import mongoose, { Schema, Types } from "mongoose";

const TransactionSchema = new Schema(
    {
        merchant_transaction_id: {
            type: String,
            required: true,
        },
        payment_transaction_id: {
            type: String,
            required: false,
        },
        amount: {
            type: Number,
            required: true,
        },
        vendor_id: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        membership_id: {
            type: Schema.Types.ObjectId,
            ref: "MembershipPlan",
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: "PENDING",
        },
        payment_type: {
            type: String,
            required: false,
        },
        utr: {
            type: String,
            required: false,
        },
        pg_transaction_id: {
            type: String,
            required: false,
        },
        bank_transaction_id: {
            type: String,
            required: false,
        },
        arn: {
            type: String,
            required: false,
        },
        pg_service_transaction_id: {
            type: String,
            required: false,
        },
        bank_id: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", TransactionSchema);
