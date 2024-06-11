import { VendorCategory } from "../models/vendorCategory.model.js";

const getAllVendorCategories = async (req, res) => {
    try {
        const vendorCategory = await VendorCategory.find().select(
            "_id name createdAt updatedAt"
        );
        if (!vendorCategory) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "cannot fetch vendor categories",
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: "vendor categories fetched successfully",
            vendorCategories: vendorCategory,
        });
    } catch (error) {
        console.error("Error fetching vendor categories:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

const getVendorAdditionalDetails = async (req, res) => {
    const { vendor_type } = req.params;
    try {
        const vendorCategory = await VendorCategory.findById({
            _id: vendor_type,
        });

        if (!vendorCategory) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "cannot fetch vendor categories",
            });
        }

        return res.status(200).json({
            status: 200,
            message: "fetched vendor additional details successfully.",
            success: true,
            vendorDetails: vendorCategory,
        });
    } catch (error) {
        console.error("Error fetching vendor additional details:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

export { getAllVendorCategories, getVendorAdditionalDetails };
