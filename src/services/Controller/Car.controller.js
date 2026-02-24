const Cars = require("../Model/Cars.model");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISH_KEY,
);

//get all cars
const getCars = async (req, res, next) => {
  try {
    const cars = await Cars.find({isAvailable:true}).sort({ createdAt: -1 });
    if (!cars) {
      res.status(200).json({
        message: "No Car found",
        status: false,
      });
    }
    res.status(200).json({
      message: "All Cars are Fetched",
      status: true,
      data: cars,
    });
  } catch (error) {
    next(error);
  }
};
const addCars = async (req, res, next) => {
  try {
    const file = req.file;
    const { name, modelno, price } = req.body;
    
    if (!file || !name || !modelno || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const filename = `file-${name}-${Date.now()}`;
    const { data, error } = await supabase.storage
      .from("RentCar") 
      .upload(filename, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from("RentCar").getPublicUrl(filename);

    const newCar = new Cars({
      name,
      imgURl: publicUrl,
      imgName: filename,
      modelNo: modelno, 
      pricePerDay: price,
      ownerId: req.user._id 
    });

    await newCar.save();
    res.status(201).json({ message: "Car uploaded successfully", status: true, data: newCar });
  } catch (error) {
    next(error);
  }
};

const deleteCars = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const car = await Cars.findById(id);
    
    if (!car) return res.status(404).json({ message: "Car not found" });
    await supabase.storage.from("RentCar").remove([car.imgName]);

    await Cars.findByIdAndDelete(id);
    res.status(200).json({ message: "Car deleted successfully", status: true });
  } catch (error) {
    next(error);
  }
};

const getOwnerCars = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cars = await Cars.find({ ownerId: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      message: "Owner cars fetched",
      status: true,
      data: cars,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { addCars, deleteCars, getCars,getOwnerCars};
