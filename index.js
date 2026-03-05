const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");
require("node:dns/promises").setServers(["1.1.1.1", "1.0.0.1"]);
const dotenv = require("dotenv");
dotenv.config();
const {createServer}= require("http")
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./src/services/Config/Database.config"); 
const userRouter = require("./src/services/Route/User.route");
const carsRouter=require("./src/services/Route/Cars.route");
const { initSocket } = require("./src/services/Utils/socket");
const app = express();
const httpServer=createServer(app);
const RentalRouter=require("./src/services/Route/Rental.route");
const NotificationRouter = require("./src/services/Route/Notification.route");
// 1. Middlewares
app.use(express.json());
app.use(cookieParser()); 

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true 
}));
initSocket(httpServer);
// 3. Routes

app.use("/ECOMERACE/user", userRouter);
app.use("/ECOMERACE/cars", carsRouter);
app.use("/ECOMERACE/rent", RentalRouter);
app.use("/ECOMERACE/notifications", NotificationRouter);

// 4. Global Error Handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});
module.exports = app;