const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../controllers/paystackController");

// NOTE: this route needs the raw request body for signature verification.
// The raw-body capture is wired up in server.js BEFORE express.json() runs.
router.post("/webhook", handleWebhook);

module.exports = router;
