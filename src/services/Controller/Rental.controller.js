const Cars = require("../Model/Cars.model");



// rent a car
const RentCar=async(req,res,next)=>{
    const {carId}=req.params;
    const car= await Cars.findById(id);
    if(!car){
        const error=new Error("Car not found");
        error.status=400
        next(error)
    }
    if(!car.isAvailable){
        const error=new Error("Car is not available for rent");
        error.status=400
        next(error)
    }
    

}