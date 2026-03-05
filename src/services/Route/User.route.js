const express = require("express");
const {
    registerUser,
    loginUser,
    verifyUser,
    updatePassword,
    deleteAccount,
    getAllUsers,
    logout,
    googleLogin,
    updateLocation
} = require("../Controller/User.controller");

const { protect } = require("../Middleware/Auth.middleware"); 

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/verify/:token', verifyUser);
router.get('/logout', logout);
//protected routes
router.put('/update-password', protect, updatePassword);
router.delete('/delete-account', protect, deleteAccount);
router.patch("/update-location", protect, updateLocation);
// --- Admin/Special Routes ---
router.get('/all-users', protect, getAllUsers); 

module.exports = router;