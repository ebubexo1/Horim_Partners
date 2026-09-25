const Complaint = require("../models/Complaint");
const ComplaintMessage = require("../models/ComplaintMessage");
const Notification = require("../models/Notification");
const generateTicketNumber = require("../utils/ticketNumber");

// @desc Submit a complaint/support ticket (logged-in partner)
// @route POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const { subject, category, description, priority, preferredContactMethod } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ success: false, message: "Subject and description are required" });
    }

    const complaint = await Complaint.create({
      ticketNumber: generateTicketNumber(),
      user: req.user._id,
      subject,
      category,
      description,
      priority,
      preferredContactMethod,
    });

    res.status(201).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

// @desc Get logged-in user's own complaints
// @route GET /api/complaints/mine
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

// @desc Get one complaint + its message thread (owner or staff only)
// @route GET /api/complaints/:id
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("user", "name email");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    const isOwner = complaint.user._id.toString() === req.user._id.toString();
    const isStaff = ["admin", "super_admin", "support"].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Not authorized to view this complaint" });
    }

    const messages = await ComplaintMessage.find({
      complaint: complaint._id,
      ...(isStaff ? {} : { isInternalNote: false }),
    })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json({ success: true, complaint, messages });
  } catch (err) {
    next(err);
  }
};

// @desc Add a message/reply to a complaint (owner or staff)
// @route POST /api/complaints/:id/messages
const addMessage = async (req, res, next) => {
  try {
    const { message, isInternalNote } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isStaff = ["admin", "super_admin", "support"].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const msg = await ComplaintMessage.create({
      complaint: complaint._id,
      sender: req.user._id,
      message,
      isInternalNote: isStaff ? !!isInternalNote : false,
    });

    if (isStaff && !isInternalNote) {
      await Notification.create({
        user: complaint.user,
        title: `Update on ticket ${complaint.ticketNumber}`,
        message: "Support has replied to your complaint.",
        type: "complaint",
      });
    }

    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    next(err);
  }
};

// --- Admin/support side ---

// @desc List all complaints (staff), with optional status/category filters
// @route GET /api/admin/complaints
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { subject: { $regex: search, $options: "i" } },
      { ticketNumber: { $regex: search, $options: "i" } },
    ];

    const complaints = await Complaint.find(filter).populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

// @desc Update complaint status / assignment (staff)
// @route PUT /api/admin/complaints/:id
const updateComplaint = async (req, res, next) => {
  try {
    const { status, assignedTo, priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (priority) complaint.priority = priority;
    await complaint.save();

    if (status) {
      await Notification.create({
        user: complaint.user,
        title: `Ticket ${complaint.ticketNumber} updated`,
        message: `Your complaint status is now: ${status.replace("_", " ")}`,
        type: "complaint",
      });
    }

    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  addMessage,
  getAllComplaints,
  updateComplaint,
};
