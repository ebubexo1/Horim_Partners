const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ["payment", "partnership", "account", "technical", "general", "other"],
      default: "general",
    },
    description: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: {
      type: String,
      enum: ["open", "under_review", "in_progress", "resolved", "closed"],
      default: "open",
    },
    preferredContactMethod: { type: String, enum: ["email", "phone", "whatsapp"], default: "email" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
