const Cars = require("../Model/Cars.model");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISH_KEY,
);

const getCars = async (req, res, next) => {
    try {
        const { lat, lng } = req.query; 
        let query = { isAvailable: true };
        if (lat && lng) {
            const cars = await Cars.find({
                ...query,
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        $maxDistance: 100000 // 50km radius
                    }
                }
            });
            return res.status(200).json({ status: true, data: cars });
        }

        const cars = await Cars.find(query).sort({ createdAt: -1 });
        res.status(200).json({ message: "All Cars Fetched", status: true, data: cars });
    } catch (error) {
        next(error);
    }
};

// 2. Add Car (With Location)
const addCars = async (req, res, next) => {
    try {
        const file = req.file;
        const { name, model, price, city, lat, lng } = req.body;

        if (!file || !name || !model || !price || !city || !lat || !lng) {
            const error = new Error("All fields including Vehicle Image, Name, Model, Price, and City are required");
            error.status = 400;
            return next(error);
        }

        const filename = `car-${Date.now()}-${name}`;
        const { data, error } = await supabase.storage
            .from("RentCar")
            .upload(filename, file.buffer, { contentType: file.mimetype });

        if (error) {
            const err = new Error(`Supabase upload failed: ${error.message}`);
            err.status = 500;
            throw err;
        }
        const { data: publicData } = supabase.storage.from("RentCar").getPublicUrl(filename);
        const publicUrl = publicData?.publicUrl || '';

        const newCar = new Cars({
            name,
            imgURl: publicUrl,
            imgName: filename,
            modelNo: model,
            pricePerDay: Number(price),
            ownerId: req.user._id,
            city,
            location: {
                type: "Point",
                coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0]
            }
        });

        await newCar.save();
        res.status(201).json({ message: "Car added successfully!", status: true, success: true, data: newCar });
    } catch (error) {
        next(error);
    }
};

const deleteCars = async (req, res, next) => {
  try {
    const { id } = req.params; 
    const car = await Cars.findById(id);
    
    if (!car) {
      const error = new Error("Car not found");
      error.status = 404;
      return next(error);
    }

    if (car.ownerId.toString() !== req.user._id.toString()) {
      const error = new Error("You are not authorized to delete this car");
      error.status = 403;
      return next(error);
    }

    if (car.imgName) {
      await supabase.storage.from("RentCar").remove([car.imgName]).catch(err => {
        console.error('Supabase image delete error:', err);
      });
    }

    await Cars.findByIdAndDelete(id);
    res.status(200).json({ message: "Car deleted successfully", status: true, success: true });
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

const editCars = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, model, price, isAvailable, city } = req.body;

    if (!name || !model || !price) {
      const error = new Error("Name, Model, and Price are required");
      error.status = 400;
      return next(error);
    }

    const car = await Cars.findById(id);

    if (!car) {
      const error = new Error("Car not found");
      error.status = 404;
      return next(error);
    }
    
    if (car.ownerId.toString() !== req.user._id.toString()) {
      const error = new Error("You are not authorized to edit this car");
      error.status = 403;
      return next(error);
    }
    
    car.name = name;
    car.pricePerDay = Number(price);
    car.modelNo = model;
    if (city) car.city = city;
    if (typeof isAvailable !== 'undefined') {
      car.isAvailable = isAvailable;
    }
    
    await car.save();
    return res.status(200).json({
      message: "Car updated successfully",
      status: true,
      success: true,
      data: car
    });

  } catch (error) {
    next(error);
  }
};
module.exports = { addCars, deleteCars, getCars,getOwnerCars,editCars};
