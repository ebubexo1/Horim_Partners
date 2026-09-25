import React, { useState } from "react";

const CURRENCY_LABEL = { NGN: "Naira Account", USD: "USD Account", GBP: "Pounds Account" };

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
        <p className="font-medium text-navy">{value}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="shrink-0 rounded-md border border-accentblue px-3 py-1.5 text-xs font-semibold text-accentblue hover:bg-accentblue hover:text-white"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default function BankAccountCard({ account }) {
  return (
    <div className="card">
      <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-gold">
        {CURRENCY_LABEL[account.currency] || account.currency}
      </h4>
      <CopyRow label="Account Name" value={account.accountName} />
      <CopyRow label="Bank Name" value={account.bankName} />
      <CopyRow label="Account Number" value={account.accountNumber} />
      <CopyRow label="Sort Code" value={account.sortCode} />
      <CopyRow label="IBAN" value={account.iban} />
      <CopyRow label="SWIFT/BIC" value={account.swiftCode} />
    </div>
  );
}
