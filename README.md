# HORIM PARTNERS — Deployment Guide

Stack: **React + Tailwind** (frontend, → Vercel) · **Node/Express + MongoDB** (backend, → Render) · **Paystack** (payments) · **MongoDB Atlas** (database).

Colors used: Navy `#0B1B3A` (primary), Gold `#C9A227` (Donate / CTAs), Blue `#2563EB` (outline buttons/accents).

---

## 0. What's built vs. what's scaffolded

**Fully working:** homepage, donate page (Paystack one-time + bank transfer with copy buttons), Paystack webhook (source of truth for payment confirmation), become-a-partner + levels, partner registration/login (JWT), partner dashboard (overview, giving summary, payment history, additional donations, "My Partners" network, notifications, complaints), admin dashboard (stats, donations w/ filters + CSV export, partner management, complaint management, bank account settings, partnership level settings), role-based access (super_admin/admin/support/partner).

**Scaffolded, needs a decision from you:** true Paystack **recurring subscriptions** (`utils/paystack.js` has `createPlan`/`createSubscription` helpers ready — currently each partnership payment charges once via `choose-level`/`additional-donation`; wiring monthly auto-charges is the next step once you confirm you want subscriptions vs. manual monthly re-charge reminders). Complaint file attachments and email-sending are stubbed (Notification records are created in-app; wire a mailer like Resend/Nodemailer later if you want actual emails).

---

## 1. MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Database Access → add a user with a password.
3. Network Access → Add IP `0.0.0.0/0` (or Render's static IPs once you have them).
4. Connect → Drivers → copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/horim-partners?retryWrites=true&w=majority`
5. Save this — it's your `MONGO_URI`.

---

## 2. Paystack

1. Dashboard → Settings → API Keys & Webhooks. Copy your **Secret Key** and **Public Key** (use `sk_test_...`/`pk_test_...` first, switch to live keys after testing).
2. You'll set the **Webhook URL** *after* you deploy the backend (step 4) — it must be:
   `https://YOUR-RENDER-URL.onrender.com/api/paystack/webhook`
3. The secret key is used **only** in the backend `.env` — it never touches frontend code (see `backend/src/utils/paystack.js`).

---

## 3. Backend → Render

1. Push the `backend/` folder to a GitHub repo (or the whole `horim-partners/` monorepo — Render lets you set a Root Directory).
2. Render Dashboard → New → Web Service → connect your repo.
3. Settings:
   - **Root Directory:** `backend` (if monorepo)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Add Environment Variables (Render → Environment tab) — copy every key from `backend/.env.example`:
   - `MONGO_URI` → your Atlas string
   - `JWT_SECRET` → any long random string
   - `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`
   - `CLIENT_URL` → your Vercel URL (set this after step 5, then redeploy)
   - `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_NAME`
   - `NODE_ENV=production`
5. Deploy. Once live, note your backend URL, e.g. `https://horim-partners-api.onrender.com`.
6. Seed the database once (Render → Shell tab, or run locally pointed at Atlas):
   ```
   npm run seed
   ```
   This creates your Super Admin login, the 4 default partnership levels, and placeholder bank accounts you'll edit in step 6.
7. Go back to Paystack → Webhooks → set the URL to `https://YOUR-RENDER-URL.onrender.com/api/paystack/webhook`.

---

## 4. Frontend → Vercel

1. Push `frontend/` to GitHub (or same monorepo, Root Directory = `frontend`).
2. Vercel → New Project → import repo.
3. Framework Preset: **Vite**. Build Command: `npm run build`. Output Directory: `dist`.
4. Environment Variables:
   - `VITE_API_URL` = `https://YOUR-RENDER-URL.onrender.com/api`
5. Deploy. Note your Vercel URL, e.g. `https://horim-partners.vercel.app`.
6. Go back to Render → set `CLIENT_URL` to this Vercel URL → redeploy the backend (needed for CORS + Paystack redirect callbacks to work correctly).

---

## 5. First login

- Go to `/portal` on your live frontend → "I'm already a partner" → log in with `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` → you'll land on `/admin`.
- **Change that password immediately** (create a new admin via Admin → Staff API, or update it directly in Atlas, then disable/remove the seed account if you want).

## 6. Add your real bank details

Admin Dashboard → **Bank Accounts** tab → fill in the real NGN/USD/GBP account details. They save instantly and appear on the public `/donate` page right away — no code changes needed.

## 7. Adjust partnership amounts anytime

Admin Dashboard → **Partnership Levels** tab → edit Bronze/Silver/Gold/Platinum amounts, descriptions and benefits without touching code.

---

## Local development

```bash
# backend
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, PAYSTACK_SECRET_KEY
npm install
npm run seed
npm run dev             # http://localhost:5000

# frontend (new terminal)
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
```

For local Paystack webhook testing, use the Paystack CLI or a tunnel (ngrok) pointed at `http://localhost:5000/api/paystack/webhook`.

## Security notes already implemented

- Passwords hashed with bcrypt · JWT auth · role-based route protection (`middleware/auth.js`)
- Paystack secret key server-side only, never sent to the frontend
- Webhook signature verified with HMAC-SHA512 against the raw request body before any DB write (`controllers/paystackController.js`) — this is why payment status is only ever trusted from the webhook/verify endpoint, never the frontend redirect alone
- Duplicate webhook delivery is a no-op (checks `paymentStatus !== "success"` before updating)
- `helmet`, CORS locked to `CLIENT_URL`, and rate limiting on all `/api` routes are enabled in `server.js`
