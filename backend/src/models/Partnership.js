const mongoose = require("mongoose");

const partnershipSchema = new mongoose.Schema(
  {
    partner: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true },
    level: { type: String, required: true },
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ["monthly", "one-time"], default: "monthly" },
    status: { type: String, enum: ["active", "inactive", "cancelled"], default: "active" },
    subscriptionReference: { type: String },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partnership", partnershipSchema);
