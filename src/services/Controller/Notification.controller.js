const Notification = require('../Model/Notification.model');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // fetch unread notifications first, newest first
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const notif = await Notification.findOne({ _id: id, recipient: userId });
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    notif.read = true;
    await notif.save();
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead };
