const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { createComplaint, getMyComplaints, getComplaintById, addMessage } = require("../controllers/complaintController");

router.post("/", protect, createComplaint);
router.get("/mine", protect, getMyComplaints);
router.get("/:id", protect, getComplaintById);
router.post("/:id/messages", protect, addMessage);

module.exports = router;
