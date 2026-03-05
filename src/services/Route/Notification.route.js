const express = require('express');
const { getNotifications, markAsRead } = require('../Controller/Notification.controller');
const { protect } = require('../Middleware/Auth.middleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/mark-read', protect, markAsRead);

module.exports = router;
