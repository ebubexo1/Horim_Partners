const User = require("../models/User");
const Partner = require("../models/Partner");
const generateToken = require("../utils/generateToken");

// @desc Register a partner account (used by the "Become a Partner" flow, before payment)
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, address, country, preferredContactMethod } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, phone, password, role: "partner" });

    // Partner profile is created in "pending" status; partnershipLevel/monthlyAmount
    // get filled in when they choose a level and pay (see partnerController.setPartnershipLevel).
    await Partner.create({
      user: user._id,
      address,
      country,
      preferredContactMethod,
      partnershipLevel: "freewill",
      monthlyAmount: 0,
      status: "pending",
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Login (partner or admin/support — role decides which dashboard the frontend routes to)
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
    }

    const token = generateToken(user._id, user.role);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get the logged-in user's own profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

// @desc Update own profile
// @route PUT /api/auth/me
const updateMe = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    await req.user.save();
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe };
