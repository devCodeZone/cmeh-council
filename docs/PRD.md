# PRD — CMEH Council Patna Website & Registration Portal

> Purpose of this file: give any AI tool (or new developer) the "why" and "what" of this
> project in under two minutes, before it touches any code. Keep this in sync with reality —
> when scope changes, edit this file in the same session.

## 1. What is being built

A full-stack public website + candidate registration portal for **Electrohomeopath Council
Patna** (a professional/educational council in Patna, Bihar, India). It is not a static
brochure site — it has a real Postgres-backed database, a multi-step online application
workflow with payment and document upload, and a full internal admin dashboard for staff to
run the council's day-to-day content and registrations.

## 2. Problem being solved

Before this system, candidate registration presumably happened offline (paper forms, in
person, or manual email). This project digitizes that:

- Candidates can discover the council, its services, and colleges/courses online.
- Candidates can apply for registration entirely online: fill personal/qualification
  details, upload required documents, pay the registration fee (or skip payment if the
  council hasn't configured a fee yet), and get a PDF acknowledgement.
- Candidates can track an existing application's status without calling the office.
- Council staff get a dashboard to manage registrations, verify documents, record
  payments, and publish site content (blog, events, gallery, testimonials, FAQs, services)
  — without needing a developer for routine updates.

## 3. Target users

| User | What they do here |
|---|---|
| **Prospective candidate** | Browses the public site, reads about the council/services/colleges, submits an online registration application, uploads documents, pays the fee, tracks status later. |
| **Council admin / registration officer** | Reviews submitted applications, verifies uploaded documents, updates application status, records/reconciles payments, exports registration data to CSV. |
| **Content editor** | Publishes/edits blog posts, events, gallery images, testimonials, team bios, services, FAQs — the day-to-day marketing content. |
| **Accountant** | Views the payments ledger. |
| **Super admin** | All of the above, plus manages admin user accounts/roles, website settings (contact info, fees, socials, legal text), and per-page SEO overrides. |

Roles are enforced server-side (see `src/lib/admin-guard.ts` and the `roles` table) — this
isn't just hidden UI, API routes check the session's role before acting.

## 4. Core features (what exists today)

**Public site**
- Home, About, Services, Colleges, Informations/downloads library, Gallery, Testimonials,
  FAQ, Blog (+ post pages), Events (+ event pages), Contact form.
- Legal pages: Privacy Policy, Terms & Conditions, Refund Policy, Disclaimer.
- SEO: per-page metadata + JSON-LD structured data, auto-generated `sitemap.xml` and
  `robots.txt`, optional GA4 analytics.

**Candidate registration**
- Simplified flow (`/registration`, `src/app/api/registration/submit/route.ts`): candidate
  fills a form (session year, name, father's name, DOB, nationality, religion, birth place,
  addresses, identification mark) and optionally attaches a signature image. The submission
  is emailed directly to the council (`cmehcouncilpatna@gmail.com`) via SMTP — **there is
  currently no database record, payment step, or document upload wired into this specific
  route**; it's "collect details, email them" by design (see the comment at the top of that
  file).
- A more complete multi-step wizard also exists in the codebase
  (`src/components/registration/RegistrationWizard.tsx`, `applications` /
  `qualifications` / `application_documents` / `payments` DB tables, Razorpay integration in
  `src/lib/payment.ts`, PDF acknowledgement/receipt in `src/lib/pdf.ts`, and a public
  "Track Application" page) for the full personal details → qualifications → documents →
  declaration → review → payment flow. Check which of the two flows is actually linked from
  the live nav/homepage before assuming both are active in production.

**Admin dashboard** (`/admin`, role-gated)
- Dashboard stats/charts, registrations list/detail/status workflow with CSV export,
  authenticated document viewing/download, payments ledger, council documents/informations
  manager, blog (posts + categories), events, gallery, testimonials, team, services, FAQ,
  contact enquiries inbox, per-page SEO overrides, website settings, admin user management,
  audit log.

## 5. Explicitly NOT done yet / known gaps

- Many real-world facts are `[PLACEHOLDER]` in `src/lib/site-config.ts` (address, phone,
  registration fee, founding year, recognition/affiliation statement, social links) — **do
  not present these as real or imply government recognition** until the council supplies
  verified documentation. See the README's "Going Live Checklist" (§7) for the full list.
- SMTP, Razorpay, and Google Analytics are all optional at the code level — they no-op
  gracefully when unconfigured (see `RULES.md` for how that graceful-degradation pattern
  works and why it must be preserved).
- File storage is local disk (`UPLOADS_DIR` / `PRIVATE_UPLOADS_DIR`) — not yet swapped for
  object storage, which matters if this is ever deployed to a serverless/ephemeral-disk
  platform.

## 6. Success criteria for a "presentation-ready" demo

- `npm run dev` starts without errors.
- Public site pages render with real (or clearly-labeled placeholder) content.
- Registration form submits successfully (SMTP configured) and the council inbox receives
  the email.
- Admin login works and the dashboard's core sections (registrations, content, settings)
  are navigable.
