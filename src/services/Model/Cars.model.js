const mongoose=require("mongoose");

const carSchema=new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    modelNo:{
        type:String,
        required:true
    },
    imgURl:{
        type:String,   // here we use suba base url
        required:true
    },
    imgName:{
        type:String,
        required:true
    },
    ownerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    pricePerDay:{
        type: Number,
        required:true
    },
    isAvailable: { 
        type: Boolean,
        default: true
    }
},{timestamps:true});

module.exports=mongoose.model('Cars',carSchema)