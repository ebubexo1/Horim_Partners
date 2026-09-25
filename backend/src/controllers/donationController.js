const { nanoid } = require("nanoid");
const Donation = require("../models/Donation");
const { initializeTransaction } = require("../utils/paystack");

// @desc Start a one-time donation via Paystack. Frontend redirects the donor
//       to the returned authorization_url (Paystack's hosted checkout).
// @route POST /api/donations/paystack/init
const initDonation = async (req, res, next) => {
  try {
    const { name, email, phone, amount, currency } = req.body;

    if (!name || !email || !amount) {
      return res.status(400).json({ success: false, message: "Name, email and amount are required" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }

    const reference = `HP-DON-${Date.now()}-${nanoid(6).toUpperCase()}`;

    const donation = await Donation.create({
      name,
      email,
      phone,
      amount,
      currency: currency || "NGN",
      donationType: "one-time",
      paymentMethod: "paystack",
      paymentStatus: "pending",
      transactionReference: reference,
    });

    const paystackRes = await initializeTransaction({
      email,
      amount,
      currency: currency || "NGN",
      reference,
      metadata: { donationId: donation._id.toString(), name, phone: phone || "" },
      callback_url: `${process.env.CLIENT_URL}/donate/success?ref=${reference}`,
    });

    res.status(200).json({
      success: true,
      authorization_url: paystackRes.data.authorization_url,
      reference,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Verify a donation after Paystack redirects back (frontend calls this on the success page)
// @route GET /api/donations/paystack/verify/:reference
const verifyDonation = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const { verifyTransaction } = require("../utils/paystack");

    const donation = await Donation.findOne({ transactionReference: reference });
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    // If the webhook already confirmed it, don't re-hit Paystack unnecessarily.
    if (donation.paymentStatus === "success") {
      return res.json({ success: true, donation });
    }

    const verification = await verifyTransaction(reference);
    if (verification.data.status === "success") {
      donation.paymentStatus = "success";
      await donation.save();
    } else {
      donation.paymentStatus = verification.data.status === "abandoned" ? "abandoned" : "failed";
      await donation.save();
    }

    res.json({ success: true, donation });
  } catch (err) {
    next(err);
  }
};

// @desc Record a bank-transfer donation the donor says they've made (admin later reconciles/confirms)
// @route POST /api/donations/bank-transfer
const recordBankTransferDonation = async (req, res, next) => {
  try {
    const { name, email, phone, amount, currency } = req.body;
    if (!name || !email || !amount || !currency) {
      return res.status(400).json({ success: false, message: "Name, email, amount and currency are required" });
    }

    const reference = `HP-BANK-${Date.now()}-${nanoid(6).toUpperCase()}`;
    const donation = await Donation.create({
      name,
      email,
      phone,
      amount,
      currency,
      donationType: "bank-transfer",
      paymentMethod: "bank-transfer",
      paymentStatus: "pending", // admin marks as success once they see it land in the account
      transactionReference: reference,
    });

    res.status(201).json({ success: true, donation });
  } catch (err) {
    next(err);
  }
};

module.exports = { initDonation, verifyDonation, recordBankTransferDonation };
