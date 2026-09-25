const User = require("../models/User");
const Partner = require("../models/Partner");
const Donation = require("../models/Donation");
const Complaint = require("../models/Complaint");
const PartnershipLevel = require("../models/PartnershipLevel");

// @desc Admin dashboard overview stats
// @route GET /api/admin/overview
const getOverview = async (req, res, next) => {
  try {
    const [totalPartners, activePartners, inactivePartners] = await Promise.all([
      Partner.countDocuments({}),
      Partner.countDocuments({ status: "active" }),
      Partner.countDocuments({ status: { $in: ["inactive", "suspended"] } }),
    ]);

    const [totalDonationsAgg] = await Donation.aggregate([
      { $match: { paymentStatus: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const monthlyRecurringAgg = await Partner.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$monthlyAmount" } } },
    ]);

    const [successfulPayments, failedPayments, openComplaints, newPartnersThisMonth] = await Promise.all([
      Donation.countDocuments({ paymentStatus: "success" }),
      Donation.countDocuments({ paymentStatus: "failed" }),
      Complaint.countDocuments({ status: { $in: ["open", "under_review", "in_progress"] } }),
      Partner.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
    ]);

    const recentDonations = await Donation.find({}).sort({ createdAt: -1 }).limit(8);

    res.json({
      success: true,
      overview: {
        totalPartners,
        activePartners,
        inactivePartners,
        totalDonations: totalDonationsAgg ? totalDonationsAgg.total : 0,
        totalDonationCount: totalDonationsAgg ? totalDonationsAgg.count : 0,
        monthlyRecurringCommitments: monthlyRecurringAgg[0] ? monthlyRecurringAgg[0].total : 0,
        successfulPayments,
        failedPayments,
        openComplaints,
        newPartnersThisMonth,
      },
      recentDonations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc List/filter/search donations (admin)
// @route GET /api/admin/donations
const getDonations = async (req, res, next) => {
  try {
    const { status, type, currency, from, to, search } = req.query;
    const filter = {};
    if (status) filter.paymentStatus = status;
    if (type) filter.donationType = type;
    if (currency) filter.currency = currency;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { transactionReference: { $regex: search, $options: "i" } },
      ];
    }

    const donations = await Donation.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (err) {
    next(err);
  }
};

// @desc Export donations as CSV (admin)
// @route GET /api/admin/donations/export
const exportDonationsCSV = async (req, res, next) => {
  try {
    const donations = await Donation.find({}).sort({ createdAt: -1 });
    const header = "Name,Email,Phone,Amount,Currency,Type,Method,Status,Reference,Date\n";
    const rows = donations
      .map((d) =>
        [
          d.name, d.email, d.phone || "", d.amount, d.currency, d.donationType,
          d.paymentMethod, d.paymentStatus, d.transactionReference, d.createdAt.toISOString(),
        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=horim-donations.csv");
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
};

// @desc List/search/filter partners (admin)
// @route GET /api/admin/partners
const getPartners = async (req, res, next) => {
  try {
    const { status, level, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (level) filter.partnershipLevel = level;

    let query = Partner.find(filter).populate("user", "name email phone status").sort({ createdAt: -1 });
    let partners = await query;

    if (search) {
      const re = new RegExp(search, "i");
      partners = partners.filter((p) => re.test(p.user?.name || "") || re.test(p.user?.email || ""));
    }

    res.json({ success: true, partners });
  } catch (err) {
    next(err);
  }
};

// @desc Get a single partner profile with contribution history (admin)
// @route GET /api/admin/partners/:id
const getPartnerById = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id).populate("user", "name email phone status");
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });

    const donations = await Donation.find({ partner: partner._id }).sort({ createdAt: -1 });
    res.json({ success: true, partner, donations });
  } catch (err) {
    next(err);
  }
};

// @desc Update a partner: level, status, or reassign parent partner (admin)
// @route PUT /api/admin/partners/:id
const updatePartner = async (req, res, next) => {
  try {
    const { status, partnershipLevel, monthlyAmount, parentPartner } = req.body;
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });

    if (status) partner.status = status;
    if (partnershipLevel) partner.partnershipLevel = partnershipLevel;
    if (monthlyAmount) partner.monthlyAmount = monthlyAmount;
    if (parentPartner !== undefined) partner.parentPartner = parentPartner || null;

    await partner.save();

    // Keep the linked user's status in sync for suspend/reactivate actions
    if (status === "suspended") {
      await User.findByIdAndUpdate(partner.user, { status: "suspended" });
    } else if (status === "active") {
      await User.findByIdAndUpdate(partner.user, { status: "active" });
    }

    res.json({ success: true, partner });
  } catch (err) {
    next(err);
  }
};

// @desc Update partner's own info (admin editing on their behalf)
// @route PUT /api/admin/partners/:id/user-info
const updatePartnerUserInfo = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });

    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (phone) update.phone = phone;
    const user = await User.findByIdAndUpdate(partner.user, update, { new: true });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc Get partnership level settings (admin)
// @route GET /api/admin/partnership-levels
const getPartnershipLevels = async (req, res, next) => {
  try {
    let levels = await PartnershipLevel.find({}).sort({ amount: 1 });
    res.json({ success: true, levels });
  } catch (err) {
    next(err);
  }
};

// @desc Create/update a partnership level's amount, description, benefits (admin)
// @route PUT /api/admin/partnership-levels/:key
const upsertPartnershipLevel = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { name, amount, description, benefits, active, isMinimum } = req.body;

    const level = await PartnershipLevel.findOneAndUpdate(
      { key },
      { key, name, amount, description, benefits, active, isMinimum },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, level });
  } catch (err) {
    next(err);
  }
};

// @desc List admin/support staff (super_admin only, for assigning roles)
// @route GET /api/admin/staff
const getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ["admin", "super_admin", "support"] } }).select("-password");
    res.json({ success: true, staff });
  } catch (err) {
    next(err);
  }
};

// @desc Create a new admin/support staff account (super_admin only)
// @route POST /api/admin/staff
const createStaff = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!["admin", "support", "super_admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid staff role" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: "Email already in use" });

    const user = await User.create({ name, email, password, role, status: "active" });
    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverview,
  getDonations,
  exportDonationsCSV,
  getPartners,
  getPartnerById,
  updatePartner,
  updatePartnerUserInfo,
  getPartnershipLevels,
  upsertPartnershipLevel,
  getStaff,
  createStaff,
};
