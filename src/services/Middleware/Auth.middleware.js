
const jwt = require("jsonwebtoken");
const User = require("../Model/User.model");

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, please login again",
                status: false
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: false
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token or expired",
            status: false
        });
    }
};

module.exports = { protect };