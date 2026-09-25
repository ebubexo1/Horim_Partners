const express = require("express");
const router = express.Router();
const { initDonation, verifyDonation, recordBankTransferDonation } = require("../controllers/donationController");

router.post("/paystack/init", initDonation);
router.get("/paystack/verify/:reference", verifyDonation);
router.post("/bank-transfer", recordBankTransferDonation);

module.exports = router;
