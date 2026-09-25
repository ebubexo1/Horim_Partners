const { nanoid } = require("nanoid");
const Partner = require("../models/Partner");
const Partnership = require("../models/Partnership");
const Donation = require("../models/Donation");
const PartnershipLevel = require("../models/PartnershipLevel");
const { initializeTransaction } = require("../utils/paystack");

const LEVEL_LABELS = { bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum", freewill: "Freewill Giving" };

// @desc List active partnership levels (public — shown on "Become a Partner" page)
// @route GET /api/partnerships/levels
const getLevels = async (req, res, next) => {
  try {
    let levels = await PartnershipLevel.find({ active: true }).sort({ amount: 1 });
    if (levels.length === 0) {
      // Not seeded yet — fall back to the doc's defaults so the page never looks broken
      levels = [
        { key: "bronze", name: "Bronze", amount: 50000, description: "Start your partnership journey with Horim.", benefits: ["Monthly impact updates"], isMinimum: false },
        { key: "silver", name: "Silver", amount: 250000, description: "Grow the mission with consistent monthly support.", benefits: ["Monthly impact updates", "Partner newsletter"], isMinimum: false },
        { key: "gold", name: "Gold", amount: 500000, description: "Become a core partner in sustaining our work.", benefits: ["Monthly impact updates", "Partner newsletter", "Quarterly partner calls"], isMinimum: false },
        { key: "platinum", name: "Platinum", amount: 1000000, description: "Lead the partnership as a principal supporter.", benefits: ["All Gold benefits", "Direct line to leadership"], isMinimum: true },
      ];
    }
    res.json({ success: true, levels });
  } catch (err) {
    next(err);
  }
};

// @desc Set/choose a partnership level + amount for the logged-in partner, then
//       kick off the Paystack transaction that will fund the first payment.
// @route POST /api/partners/choose-level
const chooseLevel = async (req, res, next) => {
  try {
    const { level, amount } = req.body; // level: bronze|silver|gold|platinum|freewill
    if (!level) {
      return res.status(400).json({ success: false, message: "Partnership level is required" });
    }

    const partner = await Partner.findOne({ user: req.user._id });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner profile not found" });
    }

    let monthlyAmount = amount;
    if (level !== "freewill") {
      const levelDoc = await PartnershipLevel.findOne({ key: level });
      const defaults = { bronze: 50000, silver: 250000, gold: 500000, platinum: 1000000 };
      monthlyAmount = levelDoc ? levelDoc.amount : defaults[level];
      if (level === "platinum" && amount && Number(amount) > monthlyAmount) {
        monthlyAmount = Number(amount);
      }
    }
    if (!monthlyAmount || monthlyAmount <= 0) {
      return res.status(400).json({ success: false, message: "A valid contribution amount is required" });
    }

    partner.partnershipLevel = level;
    partner.monthlyAmount = monthlyAmount;
    await partner.save();

    const reference = `HP-PTR-${Date.now()}-${nanoid(6).toUpperCase()}`;

    const donation = await Donation.create({
      donor: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      amount: monthlyAmount,
      currency: "NGN",
      donationType: "partnership",
      paymentMethod: "paystack",
      paymentStatus: "pending",
      transactionReference: reference,
      partner: partner._id,
    });

    const paystackRes = await initializeTransaction({
      email: req.user.email,
      amount: monthlyAmount,
      currency: "NGN",
      reference,
      metadata: { partnerId: partner._id.toString(), level, donationId: donation._id.toString() },
      callback_url: `${process.env.CLIENT_URL}/partner/payment-success?ref=${reference}`,
    });

    res.json({
      success: true,
      authorization_url: paystackRes.data.authorization_url,
      reference,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get the logged-in partner's dashboard overview
// @route GET /api/partners/me
const getMyPartnerProfile = async (req, res, next) => {
  try {
    const partner = await Partner.findOne({ user: req.user._id }).populate("user", "name email phone");
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner profile not found" });
    }

    const donations = await Donation.find({ donor: req.user._id, paymentStatus: "success" }).sort({ createdAt: -1 });
    const totalContributed = donations.reduce((sum, d) => sum + d.amount, 0);
    const lastPayment = donations[0] || null;

    res.json({
      success: true,
      partner,
      levelLabel: LEVEL_LABELS[partner.partnershipLevel],
      givingSummary: {
        totalContributed,
        monthlyCommitment: partner.monthlyAmount,
        successfulPayments: donations.length,
        lastPayment,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Payment / contribution history for the logged-in partner
// @route GET /api/partners/me/payments
const getMyPayments = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (err) {
    next(err);
  }
};

// @desc "My Partners" — partners referred/attached under the logged-in partner
// @route GET /api/partners/me/network
const getMyNetwork = async (req, res, next) => {
  try {
    const myPartner = await Partner.findOne({ user: req.user._id });
    if (!myPartner) return res.status(404).json({ success: false, message: "Partner profile not found" });

    const network = await Partner.find({ parentPartner: myPartner._id })
      .populate("user", "name email")
      .select("partnershipLevel status createdAt user");

    res.json({ success: true, network });
  } catch (err) {
    next(err);
  }
};

// @desc Make an additional (top-up) donation as a logged-in partner
// @route POST /api/partners/me/additional-donation
const makeAdditionalDonation = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "A valid amount is required" });
    }
    const partner = await Partner.findOne({ user: req.user._id });
    const reference = `HP-ADD-${Date.now()}-${nanoid(6).toUpperCase()}`;

    const donation = await Donation.create({
      donor: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      amount,
      currency: currency || "NGN",
      donationType: "freewill",
      paymentMethod: "paystack",
      paymentStatus: "pending",
      transactionReference: reference,
      partner: partner ? partner._id : null,
    });

    const paystackRes = await initializeTransaction({
      email: req.user.email,
      amount,
      currency: currency || "NGN",
      reference,
      metadata: { donationId: donation._id.toString() },
      callback_url: `${process.env.CLIENT_URL}/partner/payment-success?ref=${reference}`,
    });

    res.json({ success: true, authorization_url: paystackRes.data.authorization_url, reference });
  } catch (err) {
    next(err);
  }
};

// @desc Change partnership level (self-service request; takes effect immediately here,
//       flag for admin review if your organisation wants approval first)
// @route PUT /api/partners/me/change-level
const changeLevel = async (req, res, next) => {
  try {
    const { level, amount } = req.body;
    const partner = await Partner.findOne({ user: req.user._id });
    if (!partner) return res.status(404).json({ success: false, message: "Partner profile not found" });

    const defaults = { bronze: 50000, silver: 250000, gold: 500000, platinum: 1000000 };
    partner.partnershipLevel = level;
    partner.monthlyAmount = level === "freewill" ? amount : (defaults[level] || amount);
    await partner.save();

    res.json({ success: true, partner });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLevels,
  chooseLevel,
  getMyPartnerProfile,
  getMyPayments,
  getMyNetwork,
  makeAdditionalDonation,
  changeLevel,
};
