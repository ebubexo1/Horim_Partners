const axios = require("axios");

// All Paystack calls happen here, server-side only.
// The secret key NEVER leaves this file / this server.
const paystackAPI = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// Initialize a transaction. amount is in the major currency unit (e.g. Naira), we convert to kobo.
const initializeTransaction = async ({ email, amount, currency = "NGN", reference, metadata = {}, callback_url }) => {
  const payload = {
    email,
    amount: Math.round(amount * 100), // Paystack expects the smallest currency unit
    currency,
    reference,
    metadata,
  };
  if (callback_url) payload.callback_url = callback_url;

  const { data } = await paystackAPI.post("/transaction/initialize", payload);
  return data;
};

const verifyTransaction = async (reference) => {
  const { data } = await paystackAPI.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return data;
};

// --- Recurring / subscriptions (for partnership plans) ---
// Paystack subscriptions require a Plan to exist first. We create/find a plan per partnership level+amount.
const createPlan = async ({ name, amount, interval = "monthly", currency = "NGN" }) => {
  const { data } = await paystackAPI.post("/plan", {
    name,
    amount: Math.round(amount * 100),
    interval,
    currency,
  });
  return data;
};

const createSubscription = async ({ customer, plan, authorization }) => {
  const { data } = await paystackAPI.post("/subscription", { customer, plan, authorization });
  return data;
};

module.exports = {
  paystackAPI,
  initializeTransaction,
  verifyTransaction,
  createPlan,
  createSubscription,
};
