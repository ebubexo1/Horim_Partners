const Notification = require("../models/Notification");

// @desc Get logged-in user's notifications
// @route GET /api/notifications
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

// @desc Mark a notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { readStatus: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications, markAsRead };
