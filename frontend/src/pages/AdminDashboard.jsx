import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ChangePasswordForm from "../components/ChangePasswordForm";

const TABS = ["overview", "donations", "partners", "complaints", "notifications", "bank accounts", "partnership levels", "staff", "account"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-navy">Admin Dashboard</h1>
        <span className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white">
          Logged in as {user?.role?.replace("_", " ")}
        </span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold capitalize ${tab === t ? "border-b-2 border-gold text-navy" : "text-gray-400 hover:text-navy"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "donations" && <Donations />}
      {tab === "partners" && <Partners />}
      {tab === "complaints" && <Complaints />}
      {tab === "notifications" && <AdminNotifications />}
      {tab === "bank accounts" && <BankAccounts />}
      {tab === "partnership levels" && <PartnershipLevels />}
      {tab === "staff" && <Staff />}
      {tab === "account" && <ChangePasswordForm />}
    </div>
  );
}

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const load = () => { api.get("/notifications").then((res) => setNotifications(res.data.notifications)).catch(() => {}); };
  useEffect(load, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-navy">Notifications</h3>
        {unreadCount > 0 && <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy-dark">{unreadCount} unread</span>}
      </div>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n._id}
            onClick={() => !n.readStatus && markRead(n._id)}
            className={`cursor-pointer rounded-lg border p-3 text-sm ${n.readStatus ? "border-gray-100" : "border-gold/40 bg-gold/5"}`}
          >
            <p className="font-semibold text-navy">{n.title}</p>
            <p className="text-gray-600">{n.message}</p>
            <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
          </li>
        ))}
        {notifications.length === 0 && <p className="text-sm text-gray-400">No notifications yet.</p>}
      </ul>
    </div>
  );
}

function Staff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const isSuperAdmin = user?.role === "super_admin";

  const load = () => { api.get("/admin/staff").then((res) => setStaff(res.data.staff)).catch(() => {}); };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      await api.post("/admin/staff", form);
      setMsg(`${form.name} was added as ${form.role.replace("_", " ")}.`);
      setForm({ name: "", email: "", password: "", role: "admin" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create staff account.");
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="card">
        <p className="text-sm text-gray-500">Only a Super Admin can view or add staff accounts.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card">
        <h3 className="mb-4 font-bold text-navy">Add Admin / Support Staff</h3>
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" className="input" placeholder="Temporary Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin — manage partners, donations, complaints</option>
            <option value="support">Support — manage complaints only</option>
            <option value="super_admin">Super Admin — full access, incl. adding staff</option>
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          <button className="btn-navy w-full">Add Staff Member</button>
        </form>
        <p className="mt-3 text-xs text-gray-400">They should change this password after their first login (Account tab).</p>
      </div>

      <div className="card">
        <h3 className="mb-4 font-bold text-navy">Current Staff</h3>
        <ul className="space-y-2">
          {staff.map((s) => (
            <li key={s._id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
              <div>
                <p className="font-medium text-navy">{s.name}</p>
                <p className="text-xs text-gray-500">{s.email}</p>
              </div>
              <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold capitalize text-white">{s.role.replace("_", " ")}</span>
            </li>
          ))}
          {staff.length === 0 && <p className="text-sm text-gray-400">No staff yet.</p>}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-navy">{value}</p>
    </div>
  );
}

function Overview() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/admin/overview").then((res) => setData(res.data)).catch(() => {}); }, []);
  if (!data) return <p className="text-gray-500">Loading overview…</p>;
  const o = data.overview;
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Partners" value={o.totalPartners} />
        <StatCard label="Active Partners" value={o.activePartners} />
        <StatCard label="Inactive Partners" value={o.inactivePartners} />
        <StatCard label="New This Month" value={o.newPartnersThisMonth} />
        <StatCard label="Total Donations" value={`₦${Number(o.totalDonations).toLocaleString()}`} />
        <StatCard label="Monthly Recurring" value={`₦${Number(o.monthlyRecurringCommitments).toLocaleString()}`} />
        <StatCard label="Successful Payments" value={o.successfulPayments} />
        <StatCard label="Failed Payments" value={o.failedPayments} />
        <StatCard label="Open Complaints" value={o.openComplaints} />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <h3 className="mb-4 font-bold text-navy">Recent Donations</h3>
        <table className="min-w-full text-left text-sm">
          <thead><tr className="border-b text-gray-500"><th className="pb-2">Name</th><th>Amount</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {data.recentDonations.map((d) => (
              <tr key={d._id} className="border-b last:border-0">
                <td className="py-2">{d.name}</td>
                <td>{d.currency} {d.amount.toLocaleString()}</td>
                <td className="capitalize">{d.donationType}</td>
                <td className="capitalize">{d.paymentStatus}</td>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Donations() {
  const [donations, setDonations] = useState([]);
  const [filters, setFilters] = useState({ status: "", type: "", currency: "" });

  const load = () => {
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
    api.get(`/admin/donations?${params.toString()}`).then((res) => setDonations(res.data.donations)).catch(() => {});
  };
  useEffect(load, [filters]);

  return (
    <div className="card overflow-x-auto">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-navy">Donations</h3>
        <div className="flex flex-wrap gap-2">
          <select className="input !w-auto" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select className="input !w-auto" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All types</option>
            <option value="one-time">One-time</option>
            <option value="partnership">Partnership</option>
            <option value="freewill">Freewill</option>
            <option value="bank-transfer">Bank Transfer</option>
          </select>
          <a href={`${api.defaults.baseURL}/admin/donations/export`} target="_blank" rel="noreferrer" className="btn-outline-blue !px-4 !py-2 text-sm">
            Export CSV
          </a>
        </div>
      </div>
      <table className="min-w-full text-left text-sm">
        <thead><tr className="border-b text-gray-500"><th className="pb-2">Name</th><th>Email</th><th>Amount</th><th>Type</th><th>Method</th><th>Status</th><th>Reference</th><th>Date</th></tr></thead>
        <tbody>
          {donations.map((d) => (
            <tr key={d._id} className="border-b last:border-0">
              <td className="py-2">{d.name}</td>
              <td>{d.email}</td>
              <td>{d.currency} {d.amount.toLocaleString()}</td>
              <td className="capitalize">{d.donationType}</td>
              <td className="capitalize">{d.paymentMethod}</td>
              <td className="capitalize">{d.paymentStatus}</td>
              <td className="font-mono text-xs">{d.transactionReference}</td>
              <td>{new Date(d.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {donations.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-gray-400">No donations found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Partners() {
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState("");

  const load = () => {
    api.get(`/admin/partners${search ? `?search=${encodeURIComponent(search)}` : ""}`).then((res) => setPartners(res.data.partners)).catch(() => {});
  };
  useEffect(load, [search]);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/partners/${id}`, { status });
    load();
  };

  return (
    <div className="card overflow-x-auto">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-navy">Partners</h3>
        <input className="input !w-64" placeholder="Search by name/email" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <table className="min-w-full text-left text-sm">
        <thead><tr className="border-b text-gray-500"><th className="pb-2">Name</th><th>Email</th><th>Level</th><th>Monthly</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p._id} className="border-b last:border-0">
              <td className="py-2">{p.user?.name}</td>
              <td>{p.user?.email}</td>
              <td className="capitalize">{p.partnershipLevel}</td>
              <td>₦{Number(p.monthlyAmount).toLocaleString()}</td>
              <td className="capitalize">{p.status}</td>
              <td>
                <select className="input !w-auto !py-1 text-xs" value={p.status} onChange={(e) => updateStatus(p._id, e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </td>
            </tr>
          ))}
          {partners.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-400">No partners found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [openId, setOpenId] = useState(null);
  const load = () => { api.get("/admin/complaints").then((res) => setComplaints(res.data.complaints)).catch(() => {}); };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/complaints/${id}`, { status });
    load();
  };

  return (
    <div>
      <div className="card overflow-x-auto">
        <h3 className="mb-4 font-bold text-navy">Complaints / Support Tickets</h3>
        <table className="min-w-full text-left text-sm">
          <thead><tr className="border-b text-gray-500"><th className="pb-2">Ticket</th><th>Subject</th><th>From</th><th>Category</th><th>Priority</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id} className="border-b last:border-0">
                <td className="py-2 font-mono text-xs">{c.ticketNumber}</td>
                <td>{c.subject}</td>
                <td>{c.user?.name}</td>
                <td className="capitalize">{c.category}</td>
                <td className="capitalize">{c.priority}</td>
                <td>
                  <select className="input !w-auto !py-1 text-xs" value={c.status} onChange={(e) => updateStatus(c._id, e.target.value)}>
                    <option value="open">Open</option>
                    <option value="under_review">Under Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => setOpenId(c._id)} className="text-xs font-semibold text-accentblue hover:underline">Open Ticket</button>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-gray-400">No complaints found.</td></tr>}
          </tbody>
        </table>
      </div>

      {openId && (
        <TicketThread
          id={openId}
          onClose={() => { setOpenId(null); load(); }}
          onStatusChange={(status) => updateStatus(openId, status)}
        />
      )}
    </div>
  );
}

function TicketThread({ id, onClose, onStatusChange }) {
  const [data, setData] = useState(null);
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState(false);
  const [sending, setSending] = useState(false);

  const load = () => api.get(`/complaints/${id}`).then((res) => setData(res.data)).catch(() => {});
  useEffect(() => { load(); }, [id]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/complaints/${id}/messages`, { message: reply, isInternalNote: internalNote });
      setReply("");
      setInternalNote(false);
      load();
    } finally {
      setSending(false);
    }
  };

  if (!data) return null;
  const { complaint, messages } = data;

  return (
    <div className="card mt-4 max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-navy">{complaint.subject}</h4>
          <p className="text-xs text-gray-400">#{complaint.ticketNumber} · {complaint.user?.name} · {complaint.user?.email}</p>
        </div>
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-navy">✕ Close</button>
      </div>

      <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{complaint.description}</p>

      <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
        {messages.map((m) => (
          <div key={m._id} className={`rounded-lg p-2.5 text-sm ${m.isInternalNote ? "bg-amber-50 border border-amber-200" : "bg-accentblue/5"}`}>
            <p className="text-xs font-semibold text-navy">
              {m.sender?.name} {m.isInternalNote && <span className="text-amber-600">(internal note)</span>}
            </p>
            <p className="text-gray-700">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-sm text-gray-400">No replies yet.</p>}
      </div>

      <form onSubmit={sendReply} className="space-y-2">
        <textarea className="input" rows={2} placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input type="checkbox" checked={internalNote} onChange={(e) => setInternalNote(e.target.checked)} /> Internal note (partner won't see this)
          </label>
          <button disabled={sending} className="btn-navy !px-4 !py-2 text-sm">{sending ? "Sending…" : "Send Reply"}</button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-500">Quick status:</span>
        {["open", "under_review", "in_progress", "resolved", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${complaint.status === s ? "bg-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}

function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const load = () => { api.get("/admin/bank-accounts").then((res) => setAccounts(res.data.accounts)).catch(() => {}); };
  useEffect(load, []);

  const save = async (acc) => {
    await api.put(`/admin/bank-accounts/${acc.currency}`, acc);
    load();
  };

  const CURRENCIES = ["NGN", "USD", "GBP"];
  const findAcc = (cur) => accounts.find((a) => a.currency === cur) || { currency: cur, bankName: "", accountName: "", accountNumber: "", swiftCode: "", sortCode: "", iban: "", active: true };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {CURRENCIES.map((cur) => (
        <BankAccountForm key={cur} initial={findAcc(cur)} onSave={save} />
      ))}
    </div>
  );
}

function BankAccountForm({ initial, onSave }) {
  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form
      className="card space-y-2"
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
    >
      <h4 className="font-bold text-gold">{form.currency} Account</h4>
      <input className="input" placeholder="Bank Name" value={form.bankName || ""} onChange={set("bankName")} />
      <input className="input" placeholder="Account Name" value={form.accountName || ""} onChange={set("accountName")} />
      <input className="input" placeholder="Account Number" value={form.accountNumber || ""} onChange={set("accountNumber")} />
      {form.currency !== "NGN" && <input className="input" placeholder="SWIFT/BIC" value={form.swiftCode || ""} onChange={set("swiftCode")} />}
      {form.currency === "GBP" && (
        <>
          <input className="input" placeholder="Sort Code" value={form.sortCode || ""} onChange={set("sortCode")} />
          <input className="input" placeholder="IBAN" value={form.iban || ""} onChange={set("iban")} />
        </>
      )}
      <button className="btn-navy w-full text-sm">Save</button>
    </form>
  );
}

function PartnershipLevels() {
  const [levels, setLevels] = useState([]);
  const load = () => { api.get("/admin/partnership-levels").then((res) => setLevels(res.data.levels)).catch(() => {}); };
  useEffect(load, []);

  const defaults = [
    { key: "bronze", name: "Bronze", amount: 50000 },
    { key: "silver", name: "Silver", amount: 250000 },
    { key: "gold", name: "Gold", amount: 500000 },
    { key: "platinum", name: "Platinum", amount: 1000000 },
  ];
  const list = levels.length > 0 ? levels : defaults;

  const save = async (lvl) => {
    await api.put(`/admin/partnership-levels/${lvl.key}`, lvl);
    load();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {list.map((lvl) => (
        <LevelForm key={lvl.key} initial={lvl} onSave={save} />
      ))}
    </div>
  );
}

function LevelForm({ initial, onSave }) {
  const [form, setForm] = useState({ ...initial, benefits: (initial.benefits || []).join(", ") });
  return (
    <form
      className="card space-y-2"
      onSubmit={(e) => { e.preventDefault(); onSave({ ...form, benefits: form.benefits.split(",").map((b) => b.trim()).filter(Boolean) }); }}
    >
      <h4 className="font-bold capitalize text-navy">{form.key} Level</h4>
      <input className="input" placeholder="Display Name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input type="number" className="input" placeholder="Amount (₦/month)" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      <textarea className="input" placeholder="Description" rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input className="input" placeholder="Benefits (comma-separated)" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={form.active !== false} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
      </label>
      <button className="btn-navy w-full text-sm">Save Level</button>
    </form>
  );
}
