# RULES — AI Working Rules for This Project

> Purpose of this file: this is the rulebook for any AI coding tool working in this repo.
> Read it before making changes. It says what to do, what to avoid, which libraries to use,
> how to handle errors, and hard constraints that must not be violated.

## 1. Do

- **Use the existing stack, don't introduce alternatives.** Drizzle ORM (not Prisma/raw
  SQL scattered around), Zod for validation, Tailwind CSS v4 for styling, Nodemailer for
  email, Razorpay for payments, PDFKit for PDFs, Recharts for admin charts. If a task seems
  to need a new library, check `package.json` first — there is very likely already a tool
  for it in this codebase.
- **Read settings through `getSettings()` (`src/lib/settings.ts`)**, not by importing
  `siteConfig` directly, whenever the output should reflect admin-configured overrides.
- **Put every admin API route behind `requireAdminSession(minRole)`** (`admin-guard.ts`).
  Assume `src/proxy.ts` alone is not enough.
- **Keep candidate documents private.** Anything uploaded by a candidate goes through
  `src/lib/storage.ts`'s private bucket and is served only via an authenticated route.
  Never write candidate documents to `public/`.
- **Preserve graceful degradation for optional integrations.** SMTP (`email.ts`) and
  Razorpay (`payment.ts`) must keep working (no crash, no 500) when unconfigured — they
  return a `sent: false` / skip-payment result instead. Any new optional third-party
  integration should follow this same shape.
- **Mark unverified facts with `[PLACEHOLDER]`**, exactly as the codebase already does in
  `site-config.ts`. Never invent a real-looking address, phone number, registration fee,
  founding year, or recognition/affiliation claim. If asked to "fill in" such a field
  without being given a real value, ask, or keep the placeholder and say so.
- **Use `entity-api.ts`'s generic CRUD factory** for simple admin content types (the kind
  that's just "list/create/update/delete rows with a few fields") instead of hand-rolling
  another near-identical route.
- **Run `npm run db:generate` then `npm run db:migrate`** after any change to
  `src/lib/db/schema.ts`. Never hand-edit a file under `drizzle/`.
- **Use the self-hosted local fonts** in `src/fonts/index.ts` (`next/font/local`). Do not
  switch to `next/font/google` — it requires a network call to fonts.googleapis.com at
  build time, which this project deliberately avoids (see the comment in that file).
- **Use `next dev --webpack`** for local dev on this machine (already set in
  `package.json`'s `dev` script). Next.js 16 defaults `next dev` to Turbopack, but the
  Windows native binary here has had issues (see §"Known environment quirks" below) — don't
  remove the `--webpack` flag without confirming Turbopack actually works first.

## 2. Don't

- Don't write real-looking placeholder data into `site-config.ts` or the seed script and
  present it as fact — see PRD.md §5.
- Don't add a new file-upload path that writes into `public/` for anything
  candidate-submitted or otherwise private.
- Don't bypass `requireAdminSession` "just for now" — there is no safe shortcut here; the
  audit log and role system exist specifically because admin actions matter.
- Don't commit secrets. `.env` is git-ignored; never hardcode API keys, SMTP passwords, or
  the JWT secret into source files.
- Don't remove or "clean up" the `[PLACEHOLDER]` markers to make output look more finished
  — they are a deliberate safeguard against publishing unverified legal/factual claims (see
  README §7, "Going Live Checklist").
- Don't assume both registration flows (the simplified email-only one and the full
  DB+payment wizard) are simultaneously live in production — check which is actually linked
  from navigation/homepage before changing "the" registration flow.

## 3. Error handling conventions

- API routes return `NextResponse.json({ message }, { status })` on failure — keep this
  shape consistent (see `src/app/api/registration/submit/route.ts` for the pattern:
  `400` for validation errors, `502` for a downstream failure like SMTP being down).
- Prefer explicit, user-readable `message` strings over leaking raw error objects to the
  client. Log the real error server-side (`console.error`/`console.warn`) instead.
- Zod's `safeParse` + `result.error.issues[0]?.message` is the established pattern for
  turning the first validation failure into a user-facing message — reuse it rather than
  inventing a new validation-error shape.

## 4. Known environment quirks (this machine)

- **Turbopack native binary issues on Windows.** `npm run dev` previously failed with
  `next-swc.win32-x64-msvc.node is not a valid Win32 application` even though the file
  itself is a valid PE32+ DLL — most likely Windows/antivirus blocking an unsigned
  downloaded binary rather than actual file corruption. The fix in place is `next dev
  --webpack` in `package.json`. If you ever want Turbopack back, a clean
  `node_modules` reinstall is the thing to try first, not editing the binary.
- **A broken/incomplete `node_modules` also caused `'next' is not recognized as an internal
  or external command`.** If that recurs: delete `node_modules` and `package-lock.json`,
  then `npm install` fresh.
- **Never write to `.env` via remote/automated file-write tools that guard against it** —
  some environments explicitly block writing `.env` for safety. Ask the person to paste
  changes into the file themselves in that case.

## 5. Constraints

- **Legal/compliance:** no claim of government recognition, statutory approval, or medical
  council affiliation may be published unless true and documented. This is a hard
  constraint, not a style preference — see `recognitionStatement` in `site-config.ts`.
- **Security:** candidate documents (ID proof, certificates, photo, signature) must stay
  outside the public web root at all times.
- **Payments:** never log or expose Razorpay secret keys or webhook secrets client-side.
  `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the only Razorpay value that's safe to expose to the
  browser.
- **Email:** `MAIL_FROM` must be an address the configured SMTP account is actually
  authorized to send as (e.g. matching the Gmail account when using Gmail SMTP), or sends
  will fail/be rejected — see the SMTP setup notes for this project's history with this
  exact issue.
