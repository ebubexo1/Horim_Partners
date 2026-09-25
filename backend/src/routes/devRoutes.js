const express = require("express");
const router = express.Router();
const runSeed = require("../seed/seedLogic");

// One-off seeding endpoint for hosts with no shell access (e.g. Render free tier).
// Protected by SEED_TOKEN — set this env var to a long random value, visit
// /api/dev/seed?token=YOUR_TOKEN once, then you can remove SEED_TOKEN afterwards
// to lock it back down (the route becomes unusable once the env var is unset).
router.get("/seed", async (req, res, next) => {
  try {
    if (!process.env.SEED_TOKEN || req.query.token !== process.env.SEED_TOKEN) {
      return res.status(403).json({ success: false, message: "Invalid or missing token" });
    }
    const results = await runSeed();
    res.json({ success: true, message: "Seed complete", results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
