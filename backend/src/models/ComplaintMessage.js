const mongoose = require("mongoose");

const complaintMessageSchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isInternalNote: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ComplaintMessage", complaintMessageSchema);
