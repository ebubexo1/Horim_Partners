import React from "react";

const LEVEL_STYLES = {
  bronze: "border-amber-700/40",
  silver: "border-gray-400/60",
  gold: "border-gold",
  platinum: "border-accentblue",
};

export default function PartnershipCard({ level, onSelect }) {
  const style = LEVEL_STYLES[level.key] || "border-gray-200";
  const isPlatinum = level.key === "platinum" || level.isMinimum;

  return (
    <div className={`card flex flex-col border-2 ${style} ${level.key === "gold" ? "ring-2 ring-gold/40" : ""}`}>
      <h3 className="text-lg font-bold uppercase tracking-wide text-navy">{level.name}</h3>
      <p className="mt-2 text-2xl font-extrabold text-navy">
        ₦{Number(level.amount).toLocaleString()}
        <span className="text-sm font-medium text-gray-500">{isPlatinum ? "+/month" : "/month"}</span>
      </p>
      <p className="mt-3 text-sm text-gray-600">{level.description}</p>
      {level.benefits && level.benefits.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
          {level.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-gold">✓</span> {b}
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => onSelect(level)} className="btn-navy mt-6 w-full">
        Become a {level.name} Partner
      </button>
    </div>
  );
}
