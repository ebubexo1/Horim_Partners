import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ChangePasswordForm from "../components/ChangePasswordForm";

const LEVEL_COLOR = { bronze: "bg-amber-700", silver: "bg-gray-400", gold: "bg-gold", platinum: "bg-accentblue", freewill: "bg-navy" };

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [network, setNetwork] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("overview");
  const [topupAmount, setTopupAmount] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    api.get("/partners/me").then((res) => setData(res.data)).catch(() => {});
    api.get("/partners/me/payments").then((res) => setPayments(res.data.donations)).catch(() => {});
    api.get("/partners/me/network").then((res) => setNetwork(res.data.network)).catch(() => {});
    api.get("/notifications").then((res) => setNotifications(res.data.notifications)).catch(() => {});
  };

  useEffect(load, []);

  const handleTopup = async (e) => {
    e.preventDefault();
    setError("");
    if (!topupAmount || Number(topupAmount) <= 0) return;
    try {
      const { data } = await api.post("/partners/me/additional-donation", { amount: Number(topupAmount), currency: "NGN" });
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err.response?.data?.message || "Could not start payment");
    }
  };

  if (!data) return <div className="flex min-h-[60vh] items-center justify-center text-navy">Loading your dashboard…</div>;

  const { partner, levelLabel, givingSummary } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-gray-500">Here's an overview of your partnership with Horim.</p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-semibold text-white ${LEVEL_COLOR[partner.partnershipLevel] || "bg-navy"}`}>
          {levelLabel} Partner
        </span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
        {["overview", "payments", "network", "notifications", "complaints", "account"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold capitalize ${tab === t ? "border-b-2 border-gold text-navy" : "text-gray-400 hover:text-navy"}`}
          >
            {t === "network" ? "My Partners" : t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <h3 className="font-bold text-navy">Partnership Overview</h3>
            <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-gray-500">Partner Name</dt><dd className="font-medium text-navy">{partner.user.name}</dd>
              <dt className="text-gray-500">Partnership Level</dt><dd className="font-medium text-navy">{levelLabel}</dd>
              <dt className="text-gray-500">Monthly Commitment</dt><dd className="font-medium text-navy">₦{Number(partner.monthlyAmount).toLocaleString()}</dd>
              <dt className="text-gray-500">Start Date</dt><dd className="font-medium text-navy">{new Date(partner.startDate).toLocaleDateString()}</dd>
              <dt className="text-gray-500">Status</dt><dd className="font-medium capitalize text-navy">{partner.status}</dd>
            </dl>

            <h3 className="mt-6 font-bold text-navy">Giving Summary</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">Total Given</p>
                <p className="font-bold text-navy">₦{Number(givingSummary.totalContributed).toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">Payments</p>
                <p className="font-bold text-navy">{givingSummary.successfulPayments}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">Monthly</p>
                <p className="font-bold text-navy">₦{Number(givingSummary.monthlyCommitment).toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">Last Payment</p>
                <p className="font-bold text-navy">{givingSummary.lastPayment ? new Date(givingSummary.lastPayment.createdAt).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleTopup} className="card">
              <h3 className="font-bold text-navy">Make Additional Donation</h3>
              <input type="number" min="1" className="input mt-3" placeholder="Amount (₦)" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} />
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              <button className="btn-gold mt-3 w-full">Give Now</button>
            </form>
            <Link to="/become-a-partner" className="card block text-center hover:border-accentblue">
              <p className="font-semibold text-navy">Change Partnership Level</p>
            </Link>
            <button onClick={() => setTab("account")} className="card block w-full text-left hover:border-accentblue">
              <p className="font-semibold text-navy">Update Profile / Password</p>
              <p className="mt-1 text-xs text-gray-500">Go to the Account tab to change your password.</p>
            </button>
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="card overflow-x-auto">
          <h3 className="mb-4 font-bold text-navy">Payment History</h3>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500"><th className="pb-2">Date</th><th>Amount</th><th>Type</th><th>Status</th><th>Reference</th></tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b last:border-0">
                  <td className="py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>{p.currency} {p.amount.toLocaleString()}</td>
                  <td className="capitalize">{p.donationType}</td>
                  <td className={`capitalize ${p.paymentStatus === "success" ? "text-green-600" : p.paymentStatus === "failed" ? "text-red-600" : "text-amber-600"}`}>{p.paymentStatus}</td>
                  <td className="font-mono text-xs">{p.transactionReference}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-400">No payments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "network" && (
        <div className="card">
          <h3 className="mb-4 font-bold text-navy">My Partners</h3>
          {network.length === 0 && <p className="text-sm text-gray-400">No partners are currently linked under you.</p>}
          <ul className="space-y-2">
            {network.map((n) => (
              <li key={n._id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
                <span className="font-medium text-navy">{n.user?.name}</span>
                <span className="capitalize text-gray-500">{n.partnershipLevel} · {n.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "notifications" && (
        <div className="card">
          <h3 className="mb-4 font-bold text-navy">Notifications</h3>
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n._id} className={`rounded-lg border p-3 text-sm ${n.readStatus ? "border-gray-100" : "border-gold/40 bg-gold/5"}`}>
                <p className="font-semibold text-navy">{n.title}</p>
                <p className="text-gray-600">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
              </li>
            ))}
            {notifications.length === 0 && <p className="text-sm text-gray-400">No notifications yet.</p>}
          </ul>
        </div>
      )}

      {tab === "complaints" && <ComplaintsPanel />}
      {tab === "account" && <ChangePasswordForm />}
    </div>
  );
}

function ComplaintsPanel() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ subject: "", category: "general", description: "", priority: "medium", preferredContactMethod: "email" });
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => { api.get("/complaints/mine").then((res) => setComplaints(res.data.complaints)).catch(() => {}); };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/complaints", form);
      setMsg("Your complaint has been submitted. We'll get back to you soon.");
      setShowForm(false);
      setForm({ subject: "", category: "general", description: "", priority: "medium", preferredContactMethod: "email" });
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not submit complaint.");
    }
  };

  const STATUS_COLOR = {
    open: "bg-amber-100 text-amber-700", under_review: "bg-blue-100 text-blue-700",
    in_progress: "bg-purple-100 text-purple-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-navy">Report an Issue / Complaints</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold !px-4 !py-2 text-sm">
          {showForm ? "Cancel" : "Lodge a Complaint"}
        </button>
      </div>

      {msg && <p className="mb-3 text-sm text-accentblue">{msg}</p>}

      {showForm && (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4">
          <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="payment">Payment</option>
              <option value="partnership">Partnership</option>
              <option value="account">Account/Login</option>
              <option value="technical">Technical Issue</option>
              <option value="general">General Enquiry</option>
              <option value="other">Other</option>
            </select>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <textarea className="input" rows={3} placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button className="btn-navy w-full">Submit Complaint</button>
        </form>
      )}

      <ul className="space-y-2">
        {complaints.map((c) => (
          <li key={c._id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
            <div>
              <p className="font-semibold text-navy">{c.subject}</p>
              <p className="text-xs text-gray-400">#{c.ticketNumber} · {new Date(c.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLOR[c.status]}`}>{c.status.replace("_", " ")}</span>
          </li>
        ))}
        {complaints.length === 0 && <p className="text-sm text-gray-400">No complaints submitted yet.</p>}
      </ul>
    </div>
  );
}
