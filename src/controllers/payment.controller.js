import { Transaction } from "../models/transactions.models.js";
import axios from "axios";
import uniqid from "uniqid";
import sha256 from "sha256";
import { Booking } from "../models/booking.models.js";
import { MembershipPlan } from "../models/membershipPlans.models.js";

const initiatePayment = async (req, res) => {
    const MERCHANT_ID = process.env.MERCHANT_ID;
    const SALT_KEY = process.env.SALT_KEY;
    const SALT_KEY_INDEX = process.env.SALT_KEY_INDEX;
    const PAYMENT_BASE_URI = process.env.PAYMENT_BASE_URI;
    const PAYMENT_PAY_URI = process.env.PAYMENT_PAY_URI;

    const { amount, vendor_id, membership_id, link, mobile } = req.body;

    if (!amount || !vendor_id || !membership_id || !link) {
        return res.status(400).json({
            status: 400,
            success: false,
            message:
                "provide amount, vendor_id, membership_id and link in the request body.",
        });
    }

    const merchantTransactionId = uniqid();

    const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: vendor_id,
        amount: amount * 100, // paisa
        redirectUrl: `http://localhost:5173${link}/${merchantTransactionId}`,
        redirectMode: "REDIRECT",
        mobileNumber: mobile,
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64Payload = bufferObj.toString("base64");

    const xVerify =
        sha256(base64Payload + PAYMENT_PAY_URI + SALT_KEY) +
        "###" +
        SALT_KEY_INDEX;

    const options = {
        method: "post",
        url: `${PAYMENT_BASE_URI}${PAYMENT_PAY_URI}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
        },
        data: {
            request: base64Payload,
        },
    };

    const newTransaction = await Transaction.create({
        merchant_transaction_id: merchantTransactionId,
        amount: amount,
        vendor_id: vendor_id,
        membership_id: membership_id,
        status: "PENDING",
    });

    try {
        const response = await axios.request(options);
        if (response.data.success) {
            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    url: response.data.data.instrumentResponse.redirectInfo.url,
                },
            });
        } else {
            newTransaction.status = "FAILURE";
            await newTransaction.save();
            return res.status(400).json({
                status: 400,
                success: false,
                message: "unable to initiate payment.",
            });
        }
    } catch (error) {
        newTransaction.status = "FAILURE";
        await newTransaction.save();
        console.error("error initiating payment: ", error);
        res.status(500).json({
            success: false,
            status: 500,
            message: "internal server error",
        });
    }
};

const getPaymentStatus = async (req, res) => {
    const { merchantTransactionId } = req.query;

    const MERCHANT_ID = process.env.MERCHANT_ID;
    const SALT_KEY = process.env.SALT_KEY;
    const SALT_KEY_INDEX = process.env.SALT_KEY_INDEX;
    const PAYMENT_BASE_URI = process.env.PAYMENT_BASE_URI;
    const PAYMENT_STATUS_URI = process.env.PAYMENT_STATUS_URI;

    if (!merchantTransactionId) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide merchantTransactionId in the request query.",
        });
    }

    const existsingTransaction = await Transaction.findOne({
        merchant_transaction_id: merchantTransactionId,
    });

    const xVerify =
        sha256(
            `${PAYMENT_STATUS_URI}/${MERCHANT_ID}/${merchantTransactionId}` +
                SALT_KEY
        ) +
        "###" +
        SALT_KEY_INDEX;

    const options = {
        method: "get",
        url: `${PAYMENT_BASE_URI}${PAYMENT_STATUS_URI}/${MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-MERCHANT-ID": MERCHANT_ID,
            "X-VERIFY": xVerify,
        },
    };

    try {
        const response = await axios.request(options);
        if (response.data.success) {
            existsingTransaction.status = "SUCCESS";
            existsingTransaction.payment_transaction_id =
                response.data.data.transactionId;
            existsingTransaction.payment_type =
                response.data.data.paymentInstrument.type;

            if (response.data.data.paymentInstrument.type === "CARD") {
                existsingTransaction.pg_transaction_id =
                    response.data.data.paymentInstrument.pgTransactionId;
                existsingTransaction.bank_transaction_id =
                    response.data.data.paymentInstrument.bankTransactionId;
                existsingTransaction.arn =
                    response.data.data.paymentInstrument.arn;
                existsingTransaction.bank_id =
                    response.data.data.paymentInstrument.bankId;
            }

            if (response.data.data.paymentInstrument.type === "NETBANKING") {
                existsingTransaction.pg_transaction_id =
                    response.data.data.paymentInstrument.pgTransactionId;
                existsingTransaction.pg_service_transaction_id =
                    response.data.data.paymentInstrument.pgServiceTransactionId;
                existsingTransaction.bank_id =
                    response.data.data.paymentInstrument.bankId;
            }

            if (response.data.data.paymentInstrument.type === "UPI") {
                existsingTransaction.utr =
                    response.data.data.paymentInstrument.utr;
            }

            await existsingTransaction.save();

            const existingMembership = await MembershipPlan.findById(
                existsingTransaction.membership_id
            );

            const existingBooking = await Booking.findOne({
                transaction_id: existsingTransaction._id,
            });

            if (!existingBooking) {
                const booking = await Booking.create({
                    vendor_id: existsingTransaction.vendor_id,

                    transaction_id: existsingTransaction._id,
                    membership_id: existsingTransaction.membership_id,
                    amount: existsingTransaction.amount,
                    plan_days: existingMembership.plan_days,
                });
            }

            return res.status(201).json({
                success: true,
                status: 201,
                data: response.data,
            });
        } else {
            if (existsingTransaction.status !== "SUCCESS") {
                existsingTransaction.status = "FAILURE";
                await existsingTransaction.save();
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: response.data.message,
                });
            } else {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: "link expired",
                });
            }
        }
    } catch (error) {
        existsingTransaction.status = "FAILURE";
        await existsingTransaction.save();
        console.log("error fetching payment status: ", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
        });
    }
};

export { initiatePayment, getPaymentStatus };
