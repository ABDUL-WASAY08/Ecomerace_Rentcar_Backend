const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "user name is required"] 
    },
    email: {
        type: String,
        required: [true, "user email is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        minLength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: "user"
    },
    verifyToken: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);