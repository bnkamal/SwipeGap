# SwipeGap — Swipe Your Gap. Ace Your Exam.

AI-powered micro-tutoring platform for K-12 students in Australia and India.

---

## Setup Guide (No Coding Required)

Follow these steps **in order**. Each step takes 5–10 minutes.

---

### Step 1 — Create your Supabase database

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project** → name it `swipegap` → choose region **Sydney** (AU users) or **Singapore** (IN users)
3. Wait 2 minutes for the project to launch
4. Click **SQL Editor** in the left sidebar
5. Click **New query**
6. Open the file `/supabase/migrations/001_initial_schema.sql` from this project, copy ALL the text, paste it into the SQL editor, click **Run**
7. Open `/supabase/migrations/002_rls_policies.sql`, copy ALL the text, paste and **Run**
8. Open `/supabase/seed/topics_seed.sql`, copy ALL the text, paste and **Run** (this adds 50 starter topics)
9. Go to **Settings → API** — copy your `Project URL` and `anon public` key — you'll need these in Step 3

---

### Step 2 — Create your Stripe account

1. Go to [stripe.com](https://stripe.com) → Sign up
2. Complete your business details (SwipeGap Pty Ltd)
3. Go to **Developers → API keys** → copy your Publishable key and Secret key
4. Go to **Connect** in the sidebar → enable Stripe Connect (for mentor payouts)
5. Create your subscription products (Developers → Products):
   - Basic AU: AUD $9.99/month
   - Pro AU: AUD $19.99/month
   - Premium AU: AUD $39.99/month
   - Basic IN: INR 299/month
   - Pro IN: INR 599/month
   - Premium IN: INR 999/month

---

### Step 3 — Fill in your environment variables

1. Open the file `.env.local` in this project
2. Fill in each value using the keys you collected above:

```
NEXT_PUBLIC_SUPABASE_URL=        ← from Supabase Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   ← from Supabase Settings → API
SUPABASE_SERVICE_ROLE_KEY=       ← from Supabase Settings → API (service_role key)

STRIPE_SECRET_KEY=               ← from Stripe Developers → API keys
STRIPE_WEBHOOK_SECRET=           ← add after deployment (Step 6)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= ← from Stripe Developers → API keys

ANTHROPIC_API_KEY=               ← from console.anthropic.com → API keys
DAILY_API_KEY=                   ← from daily.co → Developers
RESEND_API_KEY=                  ← from resend.com → API keys
NEXT_PUBLIC_POSTHOG_KEY=         ← from posthog.com → Project Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 4 — Create remaining accounts

| Service | URL | What to get |
|---------|-----|-------------|
| Anthropic | console.anthropic.com | API key (add $20 credit to start) |
| Daily.co | daily.co | API key (free: 10,000 min/month) |
| Resend | resend.com | API key + verify swipegap.com domain |
| PostHog | posthog.com | Project API key |

---

### Step 5 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. Push this project to a GitHub repository
3. In Vercel, click **Add New Project** → import your GitHub repo
4. In the **Environment Variables** section, add all the variables from your `.env.local`
5. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://swipegap.vercel.app`)
6. Click **Deploy** — wait 2 minutes

---

### Step 6 — Register your Stripe webhook

After deployment:
1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-vercel-url.vercel.app/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_intent.succeeded`
5. Copy the **Signing secret** → paste it as `STRIPE_WEBHOOK_SECRET` in Vercel Environment Variables
6. Redeploy for the variable to take effect

---

### Step 7 — Create your first admin user

1. Go to your deployed app → Register as a student (any email)
2. Go to Supabase → **Table Editor** → **users** table
3. Find your user row → change `role` from `student` to `admin`
4. Log out and log back in — you now have admin access at `/dashboard/admin`

---

## Adding topics (no code needed)

Go to `/dashboard/admin` → Topics → Add Topic

---

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Payments**: Stripe Checkout + Stripe Connect
- **AI**: Claude API (claude-sonnet-4-5)
- **Video**: Daily.co
- **Email**: Resend
- **Hosting**: Vercel
- **Analytics**: PostHog

---

## Support

For issues, paste the error message into your SwipeGap Claude Project and say "Fix this".

© 2025 SwipeGap Pty Ltd — swipegap.com
