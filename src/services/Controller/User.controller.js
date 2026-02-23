const User = require("../Model/User.model");
const { hashPassword, comparePassword } = require("../Utils/HashPassword");
const { sendToken } = require("../Utils/JwtToken");
const { SendVerifyEmail } = require("../Utils/SendMail");
const { OAuth2Client } = require("google-auth-library");

// 1. REGISTER USER
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            const error = new Error("All fields are required");
            error.status = 400;
            return next(error); 
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already registered",
                status: false,
            });
        }
       
        const token = `verify-${Math.round(Math.random() * 1000000)}`;
        const hashpass = await hashPassword(password);
        
        const newUser = await User.create({
            name,
            email,
            password: hashpass, 
            verifyToken: token
        });

        // Send verification email (non-blocking)
        const emailResult = await SendVerifyEmail(email, token);
        
        if (!emailResult.success) {
            console.warn("Email sending failed but user was created:", emailResult.message);
        }

        res.status(201).json({
            message: emailResult.success 
                ? "User registered successfully. Check your email for verification link." 
                : "User registered. Please check your email (or spam folder) for verification.",
            status: true,
            data: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        next(error);
    }
};

// 2. LOGIN USER (With Token)
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            const error = new Error("Email and password are required");
            error.status = 400;
            return next(error); 
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({ message: "User not found", status: false });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email first", status: false });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials", status: false });
        }

    
        sendToken(user, 200, res);

    } catch (error) {
        next(error);
    }
};

// 3. UPDATE PASSWORD
const updatePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            const error = new Error("Both passwords are required");
            error.status = 400;
            return next(error);
        }

        const user = await User.findById(req.user._id).select("+password");
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: "Old password is wrong" });

        user.password = await hashPassword(newPassword);
        await user.save();

        res.status(200).json({ message: "Password updated successfully", status: true });
    } catch (error) {
        next(error);
    }
};

// 4. DELETE ACCOUNT
const deleteAccount = async (req, res, next) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.user._id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "Account deleted successfully", status: true });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password -verifyToken");
        
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found", status: false });
        }

        res.status(200).json({
            message: "Users fetched successfully",
            status: true,
            totalUsers: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// logout controller
const logout = async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out Successfully",
    });
};
//verifyUser
const verifyUser = async (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            const error = new Error("Token not Found");
            error.status = 400;
            return next(error); 
        }
        const user = await User.findOne({ verifyToken: token });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });
        }
        user.isVerified = true;
        user.verifyToken = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now login."
        });

    } catch (error) {
        next(error);
    }
};

// google auth configuration
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res, next) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: "Google token is missing" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                isVerified: true,
                googleId: name,
                password: Math.random().toString(36).slice(-10)
            });
        }

        sendToken(user, 200, res);

    } catch (error) {
        next(error);
    }
};
module.exports = { registerUser, loginUser, updatePassword, deleteAccount, getAllUsers, logout, verifyUser, googleLogin };