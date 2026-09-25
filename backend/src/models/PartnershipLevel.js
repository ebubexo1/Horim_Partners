const mongoose = require("mongoose");

const partnershipLevelSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ["bronze", "silver", "gold", "platinum"], required: true, unique: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    benefits: [{ type: String }],
    isMinimum: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PartnershipLevel", partnershipLevelSchema);
