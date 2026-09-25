const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getOverview, getDonations, exportDonationsCSV,
  getPartners, getPartnerById, updatePartner, updatePartnerUserInfo,
  getPartnershipLevels, upsertPartnershipLevel,
  getStaff, createStaff,
} = require("../controllers/adminController");
const { getAllBankAccounts, upsertBankAccount } = require("../controllers/bankAccountController");
const { getAllComplaints, updateComplaint } = require("../controllers/complaintController");

// Every route below requires a logged-in admin/support/super_admin
router.use(protect, authorize("admin", "super_admin", "support"));

router.get("/overview", authorize("admin", "super_admin"), getOverview);

router.get("/donations", authorize("admin", "super_admin"), getDonations);
router.get("/donations/export", authorize("admin", "super_admin"), exportDonationsCSV);

router.get("/partners", authorize("admin", "super_admin"), getPartners);
router.get("/partners/:id", authorize("admin", "super_admin"), getPartnerById);
router.put("/partners/:id", authorize("admin", "super_admin"), updatePartner);
router.put("/partners/:id/user-info", authorize("admin", "super_admin"), updatePartnerUserInfo);

router.get("/partnership-levels", authorize("admin", "super_admin"), getPartnershipLevels);
router.put("/partnership-levels/:key", authorize("admin", "super_admin"), upsertPartnershipLevel);

router.get("/bank-accounts", authorize("admin", "super_admin"), getAllBankAccounts);
router.put("/bank-accounts/:currency", authorize("admin", "super_admin"), upsertBankAccount);

router.get("/complaints", getAllComplaints); // admin + support can view
router.put("/complaints/:id", updateComplaint); // admin + support can respond

router.get("/staff", authorize("super_admin"), getStaff);
router.post("/staff", authorize("super_admin"), createStaff);

module.exports = router;
