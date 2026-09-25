const express = require("express");
const router = express.Router();
const { getPublicBankAccounts } = require("../controllers/bankAccountController");

router.get("/", getPublicBankAccounts); // public

module.exports = router;
