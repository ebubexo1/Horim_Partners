// Run with: npm run seed  (for local/CLI use — needs shell access)
require("dotenv").config();
const connectDB = require("../config/db");
const runSeed = require("./seedLogic");

const run = async () => {
  await connectDB();
  const results = await runSeed();
  console.log("[Seed] Result:", results);
  console.log("[Seed] Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error("[Seed] Failed:", err);
  process.exit(1);
});
