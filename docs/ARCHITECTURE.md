# ARCHITECTURE — CMEH Council Patna

> Purpose of this file: explain how the app is put together — flow, folders, and how the
> pieces talk to each other — so an AI tool can locate the right file on the first try
> instead of guessing.

## 1. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript) |
| Dev bundler | Webpack (`next dev --webpack`) — see `RULES.md` §"Turbopack" for why |
| Styling | Tailwind CSS v4, CSS-variable-based theme (see `DESIGN.md`) |
| Database | PostgreSQL, via Drizzle ORM (`drizzle-orm` + `pg`) |
| Auth | Custom JWT session in an httpOnly cookie + bcrypt password hashing, role-based |
| Payments | Razorpay (orders, signature verification, webhook) — optional, degrades gracefully |
| Email | Nodemailer over SMTP — optional, degrades gracefully |
| File storage | Local filesystem, split into a public bucket and a private (auth-only) bucket |
| PDF generation | PDFKit |
| Charts | Recharts (admin dashboard only) |
| Validation | Zod |

## 2. High-level request flow

**Public page load:** browser → `src/app/(site)/layout.tsx` (fetches settings via
`src/lib/settings.ts`, renders `Header`/`Footer`) → the page's own `page.tsx` → data comes
from `src/lib/queries.ts` (public-facing reads) straight to Drizzle → Postgres.

**Registration submit (current simplified flow):** `RegistrationWizard` /
`SimpleRegistrationForm` component → `POST /api/registration/submit` → validates with Zod
(`src/lib/validations.ts`) → builds an email via `src/lib/email.ts` → sends via SMTP → no DB
row is written by this route.

**Admin request:** browser → `src/proxy.ts` (Next 16 middleware — checks the session cookie
exists before the request even reaches the route) → the specific admin page/API route →
`src/lib/admin-guard.ts`'s `requireAdminSession(minRole)` re-checks the session server-side
and enforces the role → the route reads/writes via Drizzle.

**Payment:** admin/candidate action → `src/lib/payment.ts` (Razorpay order creation) →
Razorpay checkout on the client → `POST /api/payment/verify` (signature check) and/or
`POST /api/payment/webhook` (async confirmation) → `payments` table updated.

## 3. Folder structure (what lives where)

```
src/
  app/
    (site)/              Public website route group — its own root layout (Header, Footer,
                          WhatsApp FAB). Route groups in parentheses don't affect the URL.
      page.tsx             Home
      about/ services/ colleges/ informations/ gallery/ testimonials/ faq/ contact/
      blog/ blog/[slug]/   events/ events/[slug]/
      registration/ registration/success/ track-application/
      privacy-policy/ terms-conditions/ refund-policy/ disclaimer/
    admin/
      layout.tsx            Separate root layout for /admin/* — NO public header/footer
      login/                Admin login (outside the dashboard shell/session)
      (dashboard)/          Authenticated route group (sidebar + topbar chrome)
        page.tsx              Dashboard home (stats, charts)
        registrations/ payments/ informations/
        blog/ events/ gallery/ testimonials/ team/ services/ faq/
        enquiries/ settings/ users/ seo/ audit-logs/
    api/
      registration/ payment/ track/ contact/    Public-facing API routes
      admin/                                     Admin-only API routes (session+role gated)
    favicon.ico  robots.ts  sitemap.ts
  components/
    site/                 Header, Footer, WhatsApp FAB, back-to-top, legal page shell
    admin/                Sidebar, topbar, dashboard forms/charts (all "use client")
    registration/         Multi-step wizard + simplified form + file upload + step indicator
    cards/                Reusable card components (blog, event, service, document)
    ui/                   Generic building blocks: Button/LinkButton, Breadcrumbs,
                          SectionHeading, Toast
  lib/
    db/
      schema.ts             Drizzle table definitions — the source of truth for the data model
      index.ts              Drizzle client instance
    auth.ts                 Session issuing/verification, password hashing, role checks
    admin-guard.ts           requireAdminSession(minRole) — call this at the top of every
                             admin API route handler
    entity-api.ts             Generic CRUD route factory used by several simple admin
                             content routes (categories, FAQs, etc.) — check this before
                             writing a new one-off CRUD route by hand
    storage.ts                 Public vs. private file storage (size/MIME limits live here)
    payment.ts                  Razorpay integration
    email.ts                     SMTP sending + HTML email templates
    settings.ts                   Runtime settings: site-config.ts defaults, overridden by
                                 rows in the website_settings table when present
    site-config.ts                 Default/placeholder site configuration (see PRD.md §5)
    seo.ts                          Metadata + JSON-LD builders (buildMetadata,
                                   organizationJsonLd, websiteJsonLd)
    queries.ts                       Public-facing data reads
    admin-queries.ts                  Admin-facing data reads/writes
    validations.ts                     Zod schemas
    utils.ts, analytics.ts, audit.ts, colleges-data.ts, registration-constants.ts,
    razorpay-client.ts, pdf.ts
  fonts/                  Self-hosted variable fonts (see RULES.md — do not switch to
                          next/font/google)
scripts/
  seed.ts                 Baseline + sample data seeder (npm run db:seed)
drizzle/                  Generated SQL migrations (npm run db:generate / db:migrate)
public/                   Static assets served as-is — logo.png, uploaded public images
private-uploads/          Candidate documents — NEVER served as static files, only through
                          an authenticated API route
```

## 4. Data model (tables in `src/lib/db/schema.ts`)

`roles`, `users` (admin/staff accounts), `candidates`, `applications`, `qualifications`,
`application_documents`, `payments`, `categories`, `council_documents`, `blog_categories`,
`blog_posts`, `events`, `gallery_items`, `testimonials`, `team_members`, `faq_items`,
`services`, `contact_enquiries`, `website_settings`, `seo_meta`, `audit_logs`.

If you add or change a table: edit `schema.ts`, run `npm run db:generate` to create a
migration, then `npm run db:migrate` to apply it. Never hand-edit generated SQL in
`drizzle/`.

## 5. How the pieces connect — key conventions

- **Two independent root layouts.** `(site)` and `admin` each have their own `layout.tsx`.
  The admin area intentionally has no public header/footer — don't import site chrome into
  admin pages or vice versa.
- **Settings are two-layered.** `site-config.ts` holds compile-time defaults;
  `src/lib/settings.ts` merges in any `website_settings` DB row on top. Always read settings
  through `getSettings()` in server code — don't import `siteConfig` directly in a page that
  needs to reflect admin edits.
- **Every admin API route must call `requireAdminSession(minRole)`** from
  `admin-guard.ts` before touching data. `src/proxy.ts` (middleware) is a first line of
  defense, not a substitute for this per-route check.
- **Private documents never touch `public/`.** They're written to `PRIVATE_UPLOADS_DIR` and
  served only through an authenticated API route that re-checks the session/role. If you add
  a new candidate-document type, follow this same pattern — do not put it in `public/` or
  `UPLOADS_DIR`.
- **Optional integrations degrade, they don't throw.** SMTP (`email.ts`) and Razorpay
  (`payment.ts`) both check for configuration and return a `{ sent: false }` /
  "skip payment" style result rather than crashing the request when unconfigured. Preserve
  this pattern in any new integration — see `RULES.md`.
- **Simple CRUD content types go through `entity-api.ts`** rather than each getting a fully
  hand-written route — check there first before adding a new admin content route.
