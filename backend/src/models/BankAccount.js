const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema(
  {
    currency: { type: String, enum: ["NGN", "USD", "GBP"], required: true, unique: true },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    swiftCode: { type: String },
    sortCode: { type: String },
    iban: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankAccount", bankAccountSchema);
