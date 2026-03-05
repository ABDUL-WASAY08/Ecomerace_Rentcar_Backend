const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    name: { type: String, required: true },
    modelNo: { type: String, required: true },
    imgURl: { type: String, required: true },
    imgName: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pricePerDay: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    city: { 
        type: String, 
        required: [true, "City is required for filtering"],
        lowercase: true 
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } 
    }
}, { timestamps: true });
carSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Cars', carSchema);