const express = require("express");
const router = express.Router();
const {protect} = require("../Middleware/Auth.middleware"); 
const {
  RentCar,
  respondBooking,
  getOwnerBookings,
  getCustomerBookings,
} = require("../Controller/Rental.controller");
router.post("/request-rent", protect, RentCar);
router.get("/owner-bookings", protect, getOwnerBookings);
router.post("/respond", protect, respondBooking);
router.get("/customer-bookings", protect, getCustomerBookings);

module.exports = router;