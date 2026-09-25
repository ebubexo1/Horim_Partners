import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import PartnershipCard from "../components/PartnershipCard";

export default function BecomePartner() {
  const [levels, setLevels] = useState([]);
  const [freewillAmount, setFreewillAmount] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/partnerships/levels").then((res) => setLevels(res.data.levels)).catch(() => {});
  }, []);

  const handleSelect = (level) => {
    navigate("/partner/register", { state: { level: level.key, amount: level.amount, levelName: level.name } });
  };

  const handleFreewill = () => {
    if (!freewillAmount || Number(freewillAmount) <= 0) return;
    navigate("/partner/register", { state: { level: "freewill", amount: Number(freewillAmount), levelName: "Freewill Giving" } });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-navy">Become a Partner</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Choose a partnership level that fits you, or give a custom amount through Freewill Giving. Every
          partnership sustains our mission month after month.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {levels.map((level) => (
          <PartnershipCard key={level.key} level={level} onSelect={handleSelect} />
        ))}
      </div>

      <div className="card mx-auto mt-10 max-w-xl border-2 border-gold/50 text-center">
        <h3 className="text-lg font-bold text-navy">Freewill Giving</h3>
        <p className="mt-2 text-sm text-gray-600">Prefer a custom monthly amount? Set your own contribution below.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            min="1"
            placeholder="Enter monthly amount (₦)"
            className="input"
            value={freewillAmount}
            onChange={(e) => setFreewillAmount(e.target.value)}
          />
          <button onClick={handleFreewill} className="btn-gold sm:w-56">Continue</button>
        </div>
      </div>
    </div>
  );
}
