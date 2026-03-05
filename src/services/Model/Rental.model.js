const mongoose=require("mongoose");

const RentalSchema=new mongoose.Schema(
    {
        carId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Cars",
            required:true
        },
        ownerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        customerId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        status:{
            type:String,
            enum: ["pending", "accepted", "declined", "completed"],
            default: "pending"
        },
        startdate:{
            type:String,
            required:true
        },
        enddate:{
            type:String,
            required:true
        },
    },
    { timestamps: true }
);

module.exports= mongoose.model("Booking",RentalSchema)