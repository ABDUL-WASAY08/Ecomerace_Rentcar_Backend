const Cars = require("../Model/Cars.model");
const Rental = require("../Model/Rental.model");
const User = require("../Model/User.model");
const Notification = require("../Model/Notification.model");
const { getIo } = require("../Utils/socket");

const RentCar = async (req, res, next) => {
    try {
        const { carId, endDate, startDate } = req.body;
        const userid = req.user._id; 

        // 1. Find Car
        const car = await Cars.findById(carId);
        if (!car) {
            const error = new Error("Car not found");
            error.status = 404;
            return next(error); 
        }
        if (!car.isAvailable) {
            const error = new Error("Car is not available for rent");
            error.status = 400;
            return next(error);
        }

        const ownerId = car.ownerId.toString();

        const newBooking = new Rental({
            carId: carId,
            ownerId: ownerId,
            customerId: userid,
            startdate: startDate, 
            enddate: endDate,
        });

        await newBooking.save();

        const io = getIo();
        const notifPayload = {
            recipient: ownerId,
            sender: userid,
            type: 'new_booking',
            message: `New booking request for ${car.name}`,
            data: {
                bookingId: newBooking._id,
                carName: car.name,
                status: newBooking.status
            }
        };

        // Persist notification so owner can see it when offline
        try {
            const notifDoc = await Notification.create(notifPayload);
            // emit notification to owner's room
            io.to(ownerId).emit("notification", {
                id: notifDoc._id,
                recipient: notifDoc.recipient,
                sender: notifDoc.sender,
                type: notifDoc.type,
                message: notifDoc.message,
                data: notifDoc.data,
                createdAt: notifDoc.createdAt
            });
        } catch (err) {
            console.error('Failed to create/emit notification', err);
        }

        res.status(201).json({
            success: true,
            message: "Booking request sent to owner",
            booking: newBooking
        });

    } catch (error) {
        next(error); 
    }
};

const respondBooking = async (req, res, next) => {
    try {
        const { bookingId, action } = req.body;
        const booking = await Rental.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found", status: false });
        }
        if (booking.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized", status: false });
        }

        booking.status = action;
        await booking.save();
        if (action === "accepted") {
            await Cars.findByIdAndUpdate(booking.carId, { isAvailable: false });
        }

        const io = getIo();
        const car = await Cars.findById(booking.carId).lean();

        // Emit real-time update to customer
        io.to(booking.customerId).emit("booking_status_update", {
            bookingId: booking._id,
            status: action,
            carName: car?.name || '',
        });

        // Save a notification for the customer as well
        try {
            const customerNotif = await Notification.create({
                recipient: booking.customerId,
                sender: req.user._id,
                type: 'booking_status',
                message: `Your booking for ${car?.name || 'car'} is ${action}`,
                data: { bookingId: booking._id, status: action, carName: car?.name || '' }
            });
            io.to(booking.customerId).emit('notification', {
                id: customerNotif._id,
                recipient: customerNotif.recipient,
                sender: customerNotif.sender,
                type: customerNotif.type,
                message: customerNotif.message,
                data: customerNotif.data,
                createdAt: customerNotif.createdAt
            });
        } catch (err) {
            console.error('Failed to create/emit customer notification', err);
        }

        res.status(200).json({ success: true, message: `Booking ${action}` });
    } catch (error) {
        next(error);
    }
};

const getOwnerBookings = async (req, res, next) => {
    try {
        const bookings = await Rental.find({ ownerId: req.user._id }).lean();
        const detailed = await Promise.all(bookings.map(async (b) => {
            const car = await Cars.findById(b.carId).lean();
            const customer = await User.findById(b.customerId).lean();
            return {
                ...b,
                carName: car?.name || '',
                customerName: customer?.name || '',
            };
        }));
        res.status(200).json({ status: true, data: detailed });
    } catch (error) {
        next(error);
    }
};

const getCustomerBookings = async (req, res, next) => {
    try {
        const bookings = await Rental.find({ customerId: req.user._id }).lean();
        const detailed = await Promise.all(bookings.map(async (b) => {
            const car = await Cars.findById(b.carId).lean();
            const owner = await User.findById(b.ownerId).lean();
            return {
                ...b,
                carName: car?.name || '',
                ownerName: owner?.name || '',
            };
        }));
        res.status(200).json({ status: true, data: detailed });
    } catch (error) {
        next(error);
    }
};

module.exports = { RentCar, respondBooking, getOwnerBookings, getCustomerBookings };