// Run with: npm run seed
// Creates the super admin account, default partnership levels, and empty
// bank-account placeholders so the app is usable immediately after deploy.
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const PartnershipLevel = require("../models/PartnershipLevel");
const BankAccount = require("../models/BankAccount");

const run = async () => {
  await connectDB();

  // --- Super admin ---
  const email = process.env.SUPER_ADMIN_EMAIL || "admin@horimpartners.org";
  const existingAdmin = await User.findOne({ email });
  if (!existingAdmin) {
    await User.create({
      name: process.env.SUPER_ADMIN_NAME || "Horim Super Admin",
      email,
      password: process.env.SUPER_ADMIN_PASSWORD || "ChangeThisPassword123!",
      role: "super_admin",
      status: "active",
    });
    console.log(`[Seed] Super admin created: ${email}`);
  } else {
    console.log("[Seed] Super admin already exists, skipping.");
  }

  // --- Partnership levels ---
  const levels = [
    { key: "bronze", name: "Bronze", amount: 50000, isMinimum: false, description: "Start your partnership journey with Horim and help sustain our work every month.", benefits: ["Monthly impact updates", "Partner welcome pack"] },
    { key: "silver", name: "Silver", amount: 250000, isMinimum: false, description: "Grow the mission with consistent, meaningful monthly support.", benefits: ["Monthly impact updates", "Partner newsletter", "Annual appreciation gift"] },
    { key: "gold", name: "Gold", amount: 500000, isMinimum: false, description: "Become a core partner helping sustain and expand our programs.", benefits: ["Monthly impact updates", "Partner newsletter", "Quarterly partner calls"] },
    { key: "platinum", name: "Platinum", amount: 1000000, isMinimum: true, description: "Lead the partnership as a principal supporter of Horim's mission.", benefits: ["All Gold benefits", "Direct line to leadership", "Priority invitation to events"] },
  ];
  for (const lvl of levels) {
    await PartnershipLevel.findOneAndUpdate({ key: lvl.key }, lvl, { upsert: true });
  }
  console.log("[Seed] Partnership levels ready.");

  // --- Bank accounts (placeholders — replace in Admin Dashboard) ---
  const accounts = [
    { currency: "NGN", bankName: "[BANK NAME PLACEHOLDER]", accountName: "[ACCOUNT NAME PLACEHOLDER]", accountNumber: "[ACCOUNT NUMBER PLACEHOLDER]" },
    { currency: "USD", bankName: "[BANK NAME PLACEHOLDER]", accountName: "[ACCOUNT NAME PLACEHOLDER]", accountNumber: "[ACCOUNT NUMBER PLACEHOLDER]", swiftCode: "[SWIFT/BIC PLACEHOLDER]" },
    { currency: "GBP", bankName: "[BANK NAME PLACEHOLDER]", accountName: "[ACCOUNT NAME PLACEHOLDER]", accountNumber: "[ACCOUNT NUMBER PLACEHOLDER]", sortCode: "[SORT CODE PLACEHOLDER]", iban: "[IBAN PLACEHOLDER]", swiftCode: "[SWIFT/BIC PLACEHOLDER]" },
  ];
  for (const acc of accounts) {
    await BankAccount.findOneAndUpdate({ currency: acc.currency }, acc, { upsert: true });
  }
  console.log("[Seed] Bank account placeholders ready (update real details in Admin Dashboard).");

  console.log("[Seed] Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("[Seed] Failed:", err);
  process.exit(1);
});
