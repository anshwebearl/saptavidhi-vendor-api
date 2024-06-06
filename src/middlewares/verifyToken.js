import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
    const bearerHeader = req.headers["authorization"];

    if (!bearerHeader) {
        return res.status(400).json({
            message: "No Token Provided",
            status: 400,
            success: false,
        });
    }

    const bearerToken = bearerHeader.split(" ")[1];

    await jwt.verify(
        bearerToken,
        process.env.JWT_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: "Invalid or expired token",
                    status: 401,
                    success: false,
                });
            } else {
                req.body.decoded = decoded;
                next();
            }
        }
    );
};

export default verifyToken;
