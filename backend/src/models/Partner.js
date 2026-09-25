const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    address: { type: String, trim: true },
    country: { type: String, trim: true },
    preferredContactMethod: { type: String, enum: ["email", "phone", "whatsapp"], default: "email" },
    partnershipLevel: { type: String, enum: ["bronze", "silver", "gold", "platinum", "freewill"], required: true },
    monthlyAmount: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "active", "inactive", "suspended"], default: "pending" },
    parentPartner: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", default: null },
    notes: { type: String },
    paystackCustomerCode: { type: String },
    paystackSubscriptionCode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partner", partnerSchema);
