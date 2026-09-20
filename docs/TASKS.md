# TASKS — CMEH Council Patna

> Purpose of this file: break the project into small, numbered tasks, and keep a running
> decision log. Whenever you (human or AI) make a meaningful decision or change, add it to
> the log at the bottom — this is what lets a *different* AI tool pick up this project later
> without re-discovering context that's already been figured out.

## How to use this file

- Mark a task's status as you go: `[ ]` not started, `[~]` in progress, `[x]` done.
- Keep task descriptions small enough to finish in one sitting. If a task grows, split it.
- Add new tasks as they come up — don't let this file go stale.

## Task list

### Setup & environment
- [x] **T1** — Fix `next dev` crashing with a Turbopack/native-binary error on Windows.
  → Resolved by switching `package.json`'s `dev` script to `next dev --webpack`.
- [x] **T2** — Fix `'next' is not recognized` error (broken/incomplete `node_modules`).
  → Resolved by deleting `node_modules` + `package-lock.json` and running `npm install`
  fresh.
- [x] **T3** — Configure outbound email (SMTP) so the registration form actually sends.
  → Using Gmail SMTP (`smtp.gmail.com:587`) with an App Password for
  `cmehcouncilpatna@gmail.com`. `MAIL_FROM` must match the authenticated Gmail address or
  Gmail rejects/mangles the send.
- [ ] **T4** — Rotate the Gmail app password used during setup (it was shared in a chat
  transcript) once things are stable, as a hygiene step — generate a fresh one at
  `myaccount.google.com/apppasswords` and update `.env`.
- [ ] **T5** — Provision a real Postgres database for anything beyond local dev
  (`DATABASE_URL` currently points at local Postgres) and run `npm run db:migrate` +
  `npm run db:seed` against it.

### Branding
- [x] **T6** — Add real logo: saved to `public/logo.png`, wired into `Header.tsx` (h-16) and
  `Footer.tsx` (h-12, no wrapper background).
- [ ] **T7** — Get a transparent-background version of the logo for the footer (current PNG
  has an opaque white square baked in, which shows as a visible box on the dark footer).
- [x] **T8** — Header nav button text: "Register Online" → "Register" (both desktop and
  mobile menu variants).
- [ ] **T9** — Replace `src/app/favicon.ico` with a favicon derived from the real logo (still
  using a generic/placeholder favicon as of this writing).

### Content — replace placeholders before going live
(See `PRD.md` §5 and README §7 for the full rationale — do not skip this before a real
launch.)
- [ ] **T10** — Real office address, phone, WhatsApp number, email, office hours in
  `src/lib/site-config.ts` / Admin → Settings.
- [ ] **T11** — Real registration fee (`registrationFee.amountInr`) once the council
  confirms it — this also determines whether the app runs the "skip payment" demo path or
  the live Razorpay flow.
- [ ] **T12** — Recognition/affiliation statement — only publish once verified documentation
  exists. Do not touch this without that documentation in hand.
- [ ] **T13** — Real social media links (Facebook/Instagram/YouTube/LinkedIn).
- [ ] **T14** — Review and finalize the legal pages (Privacy Policy, Terms & Conditions,
  Refund Policy, Disclaimer) — several clauses are placeholder pending council confirmation.

### Product decision needed
- [ ] **T15** — Decide which registration flow is canonical: the simplified email-only form
  (`/api/registration/submit`, no DB record) currently linked from the nav, or the full
  multi-step wizard with DB + payment + document upload that also exists in the codebase.
  Right now both exist; only one should be the live path. Update `PRD.md` once decided.

### Production readiness (see README §7 "Going Live Checklist" for full detail)
- [ ] **T16** — Rotate `JWT_SECRET` to a strong random value (`openssl rand -base64 48`) —
  never reuse the dev value.
- [ ] **T17** — Configure real Razorpay keys + webhook once a real fee is set (T11).
- [ ] **T18** — Set real `NEXT_PUBLIC_SITE_URL` for the production domain (feeds sitemap,
  canonical tags, JSON-LD, email links).
- [ ] **T19** — Add real GA4 measurement ID + Google Search Console verification, then
  submit `sitemap.xml`.
- [ ] **T20** — Decide on file storage for uploads in production — local disk only works if
  the deploy target has a persistent filesystem; swap `src/lib/storage.ts` for object
  storage (S3-compatible) if deploying to a serverless/ephemeral platform.
- [ ] **T21** — Review admin accounts/roles before handing the dashboard to council staff;
  change the seeded admin password immediately in any non-throwaway environment.

---

## Decision log

Newest entries at the top. Format: `YYYY-MM-DD — decision/change — why — where`.

- **2026-09-20** — Header/Footer logo made bigger (`h-11` → `h-16` in Header) and footer's
  white circular badge wrapper removed around the logo image — per direct visual feedback,
  no functional impact. Files: `src/components/site/Header.tsx`,
  `src/components/site/Footer.tsx`.
- **2026-09-20** — Real logo added at `public/logo.png` (1080×1080, opaque white background,
  no transparency) and wired into Header/Footer, replacing the auto-generated initials
  badge that was there before. `src/lib/seo.ts`'s JSON-LD `logo` field already pointed at
  this path and needed no code change.
- **2026-09-19** — Chose Gmail SMTP (not a transactional provider like SendGrid/Resend) for
  the registration-notification email, using an App Password on
  `cmehcouncilpatna@gmail.com`. Reason: fastest path to a working demo; `MAIL_FROM` was
  changed to match the authenticated address after the first attempt failed silently
  (Gmail requires From ≈ authenticated account). **Follow-up (T4):** the app password used
  during this session was pasted into a chat transcript and should be rotated once
  convenient.
- **2026-09-19** — Confirmed the `next-swc.win32-x64-msvc.node` binary is a structurally
  valid PE32+ Windows DLL, not corrupted — the "not a valid Win32 application" error is more
  likely Windows/antivirus blocking an unsigned downloaded binary than file corruption.
  Decided not to chase that further and instead run dev with Webpack (`--webpack` flag),
  which sidesteps it entirely regardless of root cause.
- **2026-09-19** — `dev` script in `package.json` changed from `"next dev"` to
  `"next dev --webpack"` to work around the Turbopack/native-binary issue above.
