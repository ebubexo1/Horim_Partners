const BankAccount = require("../models/BankAccount");

// @desc Public — list active bank accounts for the Donate page
// @route GET /api/bank-accounts
const getPublicBankAccounts = async (req, res, next) => {
  try {
    const accounts = await BankAccount.find({ active: true });
    res.json({ success: true, accounts });
  } catch (err) {
    next(err);
  }
};

// @desc Admin — list all bank accounts
// @route GET /api/admin/bank-accounts
const getAllBankAccounts = async (req, res, next) => {
  try {
    const accounts = await BankAccount.find({});
    res.json({ success: true, accounts });
  } catch (err) {
    next(err);
  }
};

// @desc Admin — create or update a bank account by currency
// @route PUT /api/admin/bank-accounts/:currency
const upsertBankAccount = async (req, res, next) => {
  try {
    const { currency } = req.params;
    const { bankName, accountName, accountNumber, swiftCode, sortCode, iban, active } = req.body;

    const account = await BankAccount.findOneAndUpdate(
      { currency },
      { currency, bankName, accountName, accountNumber, swiftCode, sortCode, iban, active: active !== undefined ? active : true },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, account });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicBankAccounts, getAllBankAccounts, upsertBankAccount };
