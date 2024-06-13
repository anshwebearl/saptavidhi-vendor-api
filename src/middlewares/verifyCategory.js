const verifyCategory = async (req, res, next) => {
    const { _id } = req.body.decoded;
    try {
    } catch (error) {
        console.error("Error verifying category", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

export default verifyCategory;
