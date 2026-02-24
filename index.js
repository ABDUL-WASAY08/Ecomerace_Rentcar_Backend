const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./src/services/Config/Database.config"); 
const userRouter = require("./src/services/Route/User.route");
const carsRouter=require("./src/services/Route/Cars.route")
const app = express();

// 1. Middlewares
app.use(express.json());
app.use(cookieParser()); 

app.use(cors({
    origin: process.env.FRONTEND_URL, // http://localhost:5173
    credentials: true 
}));

// 3. Routes

app.use("/ECOMERACE/user", userRouter);
app.use("/ECOMERACE/cars", carsRouter);

// 4. Global Error Handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});