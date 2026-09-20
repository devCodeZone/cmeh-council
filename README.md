# CMEH Council Patna — Website & Registration Portal

A full-stack, production-oriented website and candidate registration portal for **Electrohomeopath Council Patna**, built with Next.js 16 (App Router), TypeScript, PostgreSQL (via Drizzle ORM), and Tailwind CSS v4.

This codebase is a working MVP: a real database schema, a public marketing/informational site, a multi-step online candidate registration flow with document upload and (optional) Razorpay payment, and a full admin dashboard for managing registrations, payments, content and site settings.

> **Important — read before publishing.** Wherever this build did not have a verified, real fact to work with (postal address, phone numbers, registration fee, founding year, government recognition/affiliation status, etc.), it uses an explicit `[PLACEHOLDER]` marker instead of inventing one. **Do not remove these placeholders or imply any recognition/affiliation status until the council supplies verified, documented facts.** See `src/lib/site-config.ts` and Admin → Settings.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-variable-based theme, easy to re-brand) |
| Database | PostgreSQL |
| ORM | Drizzle ORM (`drizzle-orm` + `pg`) |
| Auth | Custom JWT session (httpOnly cookie) + bcrypt, role-based access |
| Payments | Razorpay (orders, signature verification, webhooks) — gracefully optional |
| Email | Nodemailer over SMTP — gracefully optional (no-ops with a console warning if unconfigured) |
| File storage | Local filesystem, split into a **public** bucket and a **private** (authenticated-only) bucket |
| PDF generation | PDFKit (registration acknowledgement, payment receipt) |
| Charts | Recharts (admin dashboard) |
| Validation | Zod |

---

## 2. Features

**Public site:** home, about, services, informations/downloads library, gallery, testimonials, FAQ, blog, events, contact form, legal pages (privacy policy, terms & conditions, refund policy, disclaimer), SEO metadata + JSON-LD structured data, auto-generated `sitemap.xml` and `robots.txt`, optional GA4 analytics.

**Candidate registration:** multi-step online application form (personal details → qualifications → documents → declaration → review → payment), required-document upload with type/size validation, Razorpay checkout (or fee-free flow when no fee is configured), PDF acknowledgement and payment receipt, and a public "Track Application" lookup by application number + registered mobile/email.

**Admin dashboard** (role-gated: `super_admin` / `admin` / `registration_officer` / `content_editor` / `accountant`): dashboard stats and charts, registrations list/detail/status workflow with CSV export, authenticated document viewing/download, payments ledger, council documents/informations manager, blog (posts + categories), events, gallery, testimonials, team, services, FAQ, contact enquiries inbox, per-page SEO overrides, website settings (NAP, social links, fees, analytics IDs, legal text), admin user management, and an audit log of administrative actions.

**Security:** candidate-submitted documents (ID proof, certificates, photo, signature) are stored **outside** the public web root and are only served through an authenticated, role-checked API route — never as static files. Admin routes are protected by `src/proxy.ts` (Next.js 16's middleware) plus a per-route session/role check. Login is rate-limited.

---

## 3. Prerequisites

- Node.js 20+
- A PostgreSQL 14+ database (local, or a managed provider — see §7)
- npm (or pnpm/yarn — adjust commands accordingly)

---

## 4. Local Setup

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment variables
cp .env.example .env
# then edit .env — at minimum set DATABASE_URL to a real reachable Postgres instance

# 3. Create the database schema
npm run db:migrate
# (if you change src/lib/db/schema.ts later, run `npm run db:generate` first to create a new migration)

# 4. Seed baseline data (roles, a super-admin login, and sample content so the site isn't empty)
npm run db:seed

# 5. Start the dev server
npm run dev
```

The site runs at `http://localhost:3000`. The admin dashboard is at `http://localhost:3000/admin/login`.

**Default admin login** (created by the seed script, override via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`):

```
Email:    admin@cmehcouncilpatna.example
Password: Admin@12345
```

**Change this password immediately** after first login (Admin → Admin Users → edit your account) in any environment other than a disposable local sandbox.

---

## 5. Environment Variables

See `.env.example` for the full list with explanations. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public base URL — used in sitemap, canonical tags, JSON-LD, emails |
| `JWT_SECRET` | Yes | Signs admin session tokens — use a long random value in production |
| `SESSION_COOKIE_NAME` | No | Cookie name for the admin session (has a sane default) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | No | Override the seed script's initial admin account |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` / `ADMIN_NOTIFY_EMAIL` | No | Outbound email (registration acknowledgements, contact notifications). App runs fine without these — email sending just no-ops with a warning. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | No | Payment gateway. While these are the placeholder values (or the registration fee is set to 0 in Admin → Settings), the app skips the gateway entirely and marks applications as paid so the full workflow can be demonstrated/tested. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | No | Google Analytics 4 and Search Console verification |
| `UPLOADS_DIR` | No | Public file storage root (council documents, images) |
| `PRIVATE_UPLOADS_DIR` | No | **Private** file storage root (candidate documents) — must stay outside `public/` |
| `MAX_UPLOAD_MB` | No | Per-file upload size limit |

---

## 6. Project Structure

```
src/
  app/
    (site)/            Public website route group (its own root layout: header, footer, WhatsApp FAB)
      page.tsx          Home
      about/ services/ informations/ gallery/ testimonials/ faq/ contact/
      blog/ blog/[slug]/  events/ events/[slug]/
      registration/ registration/success/ track-application/
      privacy-policy/ terms-conditions/ refund-policy/ disclaimer/
    admin/
      layout.tsx        Separate root layout for /admin/* (no public chrome)
      login/            Admin login (outside the dashboard shell)
      (dashboard)/       Authenticated dashboard route group (sidebar + topbar)
        page.tsx          Dashboard home (stats, charts)
        registrations/ payments/ informations/
        blog/ events/ gallery/ testimonials/ team/ services/ faq/
        enquiries/ settings/ users/ seo/ audit-logs/
    api/
      registration/ payment/ track/ contact/
      admin/            All admin-only API routes (session + role gated)
    sitemap.ts robots.ts
  components/            Shared UI, site chrome, admin widgets, registration wizard
  lib/
    db/                  Drizzle schema + client
    auth.ts               Session issuing/verification, password hashing, role checks
    admin-guard.ts         `requireAdminSession(minRole)` helper for API routes
    entity-api.ts          Generic CRUD route factory for simple content tables
    storage.ts             Public vs. private file storage
    payment.ts              Razorpay integration
    email.ts                 SMTP sending + templates
    settings.ts               Runtime settings (site-config.ts defaults + DB overrides)
    site-config.ts             Default/placeholder site configuration
    seo.ts                       Metadata + JSON-LD builders
    queries.ts                    Public-facing data queries
scripts/
  seed.ts                Baseline + sample data seeder
drizzle/                 Generated SQL migrations
```

---

## 7. Going Live Checklist

Work through this list before pointing a real domain at this codebase:

1. **Replace every `[PLACEHOLDER]`.** Search the codebase and Admin → Settings for `PLACEHOLDER` and fill in verified, real values: office address, phone/WhatsApp numbers, email, office hours, Google Maps embed URL, registration fee, founding year, and social media links.
2. **Recognition/affiliation statement.** Do not publish any claim of government recognition, statutory approval, or medical council affiliation unless it is true and you can support it with verifiable documentation. Edit `recognitionStatement` in Admin → Settings only once such documentation exists.
3. **Provision a production database.** Point `DATABASE_URL` at a managed Postgres instance (Supabase, Neon, Railway, RDS, etc. all work — this project uses plain `pg`, no vendor lock-in). Run `npm run db:migrate` against it, then `npm run db:seed` once (immediately change the seeded admin password).
4. **Rotate secrets.** Generate a strong `JWT_SECRET` (`openssl rand -base64 48`) — never reuse the development value.
5. **Configure Razorpay.** Create a live Razorpay account, set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, and a webhook (pointing at `/api/payment/webhook`) with `RAZORPAY_WEBHOOK_SECRET`. Then set a real registration fee in Admin → Settings — the app automatically switches from the "skip payment" demo path to the live gateway once both a real fee and real keys are present.
6. **Configure outbound email.** Set `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` / `ADMIN_NOTIFY_EMAIL` to a real transactional email provider (Resend, SendGrid, Postmark, Amazon SES, or your own SMTP server).
7. **Set the real domain.** Update `NEXT_PUBLIC_SITE_URL` to the production URL (used by the sitemap, canonical tags, JSON-LD, and email links).
8. **Analytics & Search Console.** Add real `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` once issued for the live domain, then submit `sitemap.xml` in Search Console.
9. **Legal pages.** Review `/privacy-policy`, `/terms-conditions`, `/refund-policy` and `/disclaimer` — several clauses (effective dates, retention periods, refund windows) are marked `[PLACEHOLDER]` pending the council's confirmed policy and should be finalised (ideally with legal review) before launch.
10. **File storage in production.** `UPLOADS_DIR` and `PRIVATE_UPLOADS_DIR` default to local folders on disk. If deploying to a platform with an ephemeral filesystem (e.g. serverless/Vercel), point these at a persistent volume or swap `src/lib/storage.ts` for an object-storage backend (S3-compatible) — the module is small and isolated specifically to make that swap straightforward.
11. **Review admin accounts and roles** under Admin → Admin Users before handing the dashboard to council staff, and only grant `super_admin` to those who need it.

---

## 8. Deployment

This is a standard Next.js app with a PostgreSQL dependency, so it deploys anywhere Next.js does:

- **Vercel / Netlify / similar** + a managed Postgres provider (Supabase, Neon, Railway). Note the ephemeral-filesystem caveat in §7.10 — use persistent/object storage for uploads on these platforms.
- **A VPS or container platform** (Docker, Railway, Render, Fly.io) with `npm run build && npm run start`, alongside Postgres and a persistent disk for `UPLOADS_DIR` / `PRIVATE_UPLOADS_DIR`.

Standard build/start commands:

```bash
npm run build
npm run start
```

Run `npm run db:migrate` as part of your deploy step whenever the schema changes.

---

## 9. NPM Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start the production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a new Drizzle migration from schema changes |
| `npm run db:migrate` | Apply pending migrations to `DATABASE_URL` |
| `npm run db:push` | Push schema directly without a migration file (dev convenience) |
| `npm run db:studio` | Open Drizzle Studio to browse the database |
| `npm run db:seed` | Seed roles, an admin account, and sample content |

---

## 10. Notes on Placeholder Content

Sample blog posts, events, testimonials, team members, and gallery items seeded by `npm run db:seed` are clearly labelled as placeholders/samples and exist only so the site isn't empty on first run. Replace or delete them from the admin dashboard once real content is available. Do not leave placeholder testimonials, team bios, or recognition statements live on a public production site.
