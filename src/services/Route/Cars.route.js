const express=require("express");
const { protect } = require("../Middleware/Auth.middleware");
const upload = require("../Middleware/Multer.middleware");
const { addCars, getCars, getOwnerCars, deleteCars, editCars } = require("../Controller/Car.controller");
const router=express.Router();

router.post("/uploadCar",protect,upload.single('image'),addCars);
router.put("/updateCar/:id",protect,editCars);
router.get('/getCars',protect, getCars);
router.get('/getCar',protect,getOwnerCars);
router.delete('/deleteCar/:id',protect,deleteCars)

module.exports=router