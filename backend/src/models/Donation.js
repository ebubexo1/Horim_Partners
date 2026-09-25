const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["NGN", "USD", "GBP"], default: "NGN" },
    donationType: {
      type: String,
      enum: ["one-time", "partnership", "freewill", "bank-transfer"],
      default: "one-time",
    },
    paymentMethod: { type: String, enum: ["paystack", "bank-transfer"], required: true },
    paymentStatus: { type: String, enum: ["pending", "success", "failed", "abandoned"], default: "pending" },
    transactionReference: { type: String, required: true, unique: true },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
