const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getLevels,
  chooseLevel,
  getMyPartnerProfile,
  getMyPayments,
  getMyNetwork,
  makeAdditionalDonation,
  changeLevel,
} = require("../controllers/partnerController");

router.get("/levels", getLevels); // public
router.post("/choose-level", protect, chooseLevel);
router.get("/me", protect, getMyPartnerProfile);
router.get("/me/payments", protect, getMyPayments);
router.get("/me/network", protect, getMyNetwork);
router.post("/me/additional-donation", protect, makeAdditionalDonation);
router.put("/me/change-level", protect, changeLevel);

module.exports = router;
