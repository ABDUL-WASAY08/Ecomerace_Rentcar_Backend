const jwt = require("jsonwebtoken");
const User = require("../Model/User.model");

const protect = async (req, res, next) => {
    try {
        // 1. Check cookies OR Authorization header (Bearer token)
        let token = req.cookies.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token found",
                status: false
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Find user
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
        console.error("Auth Error:", error.message); 
        return res.status(401).json({
            message: "Invalid token or expired",
            status: false
        });
    }
};

module.exports = { protect };