const verifyOtp = (req, res, next) => {
    const { otp } = req.body;
    if (Number(otp) !== 123456) {
        return res.status(401).json({
            status: 401,
            success: false,
            message: "invalid OTP",
        });
    }
    next();
};

export default verifyOtp;
