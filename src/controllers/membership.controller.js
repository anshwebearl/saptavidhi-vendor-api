import { MembershipPlan } from "../models/membershipPlans.models.js";

const getAllMembershipPlans = async (req, res) => {
    try {
        const membershipPlans = await MembershipPlan.find();
        return res.status(200).json({
            status: 200,
            success: true,
            data: membershipPlans,
        });
    } catch (error) {
        console.log("error fetching membership plans: ", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "internal server error",
        });
    }
};

const getMembershipById = async (req, res) => {
    const { membership_id } = req.query;

    if (!membership_id) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "provide membership_id in request query.",
        });
    }

    try {
        const existingMembershipPlan = await MembershipPlan.findById(
            membership_id
        );

        if (!existingMembershipPlan) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "membership not found",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "membership fetched successfully",
            data: existingMembershipPlan,
        });
    } catch (error) {
        console.log("error deleting membership: ", error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "internal server error",
        });
    }
};

export { getAllMembershipPlans, getMembershipById };
