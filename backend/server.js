require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./src/config/db");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/authRoutes");
const donationRoutes = require("./src/routes/donationRoutes");
const paystackRoutes = require("./src/routes/paystackRoutes");
const partnerRoutes = require("./src/routes/partnerRoutes");
const bankAccountRoutes = require("./src/routes/bankAccountRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();

connectDB();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limit auth + payment init endpoints to reduce abuse
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", apiLimiter);

// --- IMPORTANT: Paystack webhook needs the RAW body to verify the signature.
// This must be registered BEFORE express.json() strips/parses the body.
app.use(
  "/api/paystack/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body; // Buffer
    try {
      req.body = JSON.parse(req.body.toString("utf8"));
    } catch (e) {
      req.body = {};
    }
    next();
  }
);

// Normal JSON body parsing for everything else
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Horim Partners API is running" });
});
app.get("/api/health", (req, res) => res.json({ success: true, status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/paystack", paystackRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/partnerships", partnerRoutes); // /api/partnerships/levels alias per spec naming
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Horim Partners API running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});
