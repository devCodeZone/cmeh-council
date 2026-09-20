# DESIGN — Visual System for CMEH Council Patna

> Purpose of this file: the single source of truth for colors, type, spacing and component
> style, so any AI tool builds new UI that matches the rest of the site instead of
> inventing its own look. The actual tokens live in
> `src/app/(site)/globals.css` and `src/lib/site-config.ts` — this file explains how to use
> them. If you change a token, change it there, then update this file to match.

## 1. Brand personality

Deep teal + muted gold — reads as trustworthy, institutional, healthcare-adjacent. Calm and
credential-oriented rather than flashy; this is a professional council's site, not a
consumer brand.

## 2. Color tokens

Defined once in `src/app/(site)/globals.css` (`:root`) and exposed to Tailwind as
`bg-brand-*` / `text-brand-*` utility classes via `@theme inline`. **Always use the
`brand-*` utility classes — never hardcode a hex value in a component.**

| Token | Hex | Tailwind class | Use for |
|---|---|---|---|
| Primary | `#0b5d52` (deep teal) | `bg-brand-primary` / `text-brand-primary` | Primary buttons, active nav state, links, header utility bar |
| Primary Dark | `#08423b` | `bg-brand-primary-dark` | Hover state of primary elements |
| Primary Light | `#e6f2f0` | `bg-brand-primary-light` | Active nav pill background, subtle highlight |
| Accent | `#c99a3a` (muted gold) | `bg-brand-accent` / `text-brand-accent` | Institutional premium accent — focus rings, accent buttons, hover highlight on dark backgrounds |
| Accent Light | `#f8efdc` | `bg-brand-accent-light` | Subtle accent background |
| Ink | `#12241f` | `text-brand-ink` | Headings, dark backgrounds (footer), primary body text on light |
| Body | `#3f4c48` | `text-brand-body` | Default paragraph text |
| Muted | `#6b7b76` | `text-brand-muted` | Secondary/caption text, tagline under nav logo |
| Surface | `#ffffff` | `bg-brand-surface` | Default page/card background |
| Surface Alt | `#f6f8f7` | `bg-brand-surface-alt` | Section background alternation, hover background |
| Border | `#e4e9e7` | `border-brand-border` | Dividers, card borders |
| Success | `#1f8a4c` | `bg-brand-success` | Approved/paid status |
| Warning | `#b8860b` | `bg-amber-500` (see note) / semantic warning | Pending/attention status |
| Danger | `#b3261e` | `bg-brand-danger` | Destructive actions, rejected status, logout button |

Note: some admin status buttons currently use Tailwind's stock `bg-amber-500` /
`bg-white/10` etc. directly rather than a `brand-warning` class — when adding new status
colors, prefer wiring a proper `brand-*` token in `globals.css` over another one-off
Tailwind color.

## 3. Typography

Two self-hosted variable fonts (`src/fonts/index.ts`, `next/font/local` — see `RULES.md` for
why not Google Fonts):

| Role | Font | CSS variable | Tailwind |
|---|---|---|---|
| Body text | Inter | `--font-body` | `font-sans` |
| Headings (`h1`–`h6`) | Manrope | `--font-heading` | `font-display` |

Headings automatically pick up `--font-heading` and `text-brand-ink` via the global `h1–h6`
rule in `globals.css` — you don't need to set the font family manually on a heading element,
only its size/weight utilities.

Common heading/body sizes in use (from existing components, not a rigid scale — match
what's already on the page you're extending):
- Page/section headings: `text-2xl` to `text-4xl`, `font-bold`
- Nav/label text: `text-[13.5px]`–`text-sm`, `font-medium`/`font-semibold`
- Body copy: `text-sm`–`text-base`
- Captions/meta (e.g. "Patna, Bihar" under the logo): `text-[11px]`, `text-brand-muted`,
  `tracking-wide`

## 4. Spacing & layout

- **Page width:** use the `.container-page` utility class (defined in `globals.css`) for
  consistent max-width (`80rem`) and side padding, rather than a new max-w wrapper.
- **Section rhythm:** vertical section spacing on the home/marketing pages generally sits in
  the `py-14`–`py-20` range; component-internal spacing uses Tailwind's default scale
  (`gap-3`, `gap-5`, `p-4`, etc.) — stay consistent with the nearest existing section rather
  than introducing a new spacing unit.
- **Rounding:** buttons and pill-shaped nav items use `rounded-full`; cards typically use
  `rounded-lg`/`rounded-xl`; avoid mixing sharp corners into an otherwise rounded UI.

## 5. Components

**Buttons** (`src/components/ui/Button.tsx`) — always use `<Button>` / `<LinkButton>` rather
than a raw `<button>`/`<a>` with hand-written classes, so new buttons stay visually
consistent automatically.

| Variant | Style | Use for |
|---|---|---|
| `primary` (default) | Solid teal, white text | Main CTAs ("Register", form submits) |
| `secondary` | White bg, teal border/text | Secondary actions on a light background |
| `outline` | Transparent, white border | CTA on a dark/colored background (hero sections) |
| `ghost` | Transparent, ink text | Low-emphasis actions (e.g. "Login" link) |
| `accent` | Solid gold | Special/featured CTA |
| `danger` | Solid red | Destructive admin actions (delete, reject) |

| Size | Padding/text | Use for |
|---|---|---|
| `sm` | `text-sm px-4 py-2` | Compact nav/header buttons |
| `md` (default) | `text-sm px-5 py-3` | Standard buttons |
| `lg` | `text-base px-7 py-3.5` | Hero CTAs |

**Header/Footer logo:** the logo is a plain `<img src="/logo.png">` (see `Header.tsx` /
`Footer.tsx`) — not wrapped in a colored badge. The source PNG is a solid 1080×1080 square
with a white background baked in (no transparency), so placing it on a dark surface (e.g.
the footer) will show that white square rather than blending in — if a seamless look is
needed there, a transparent-background export of the logo is required; this is a source-file
limitation, not something CSS can fix.

**Cards** (`src/components/cards/*`): `BlogCard`, `EventCard`, `ServiceCard`,
`DocumentCard` — reuse these for any new listing of the same content type rather than
building a bespoke card.

**Toast notifications:** use `src/components/ui/Toast.tsx`'s `ToastProvider`/`push` pattern
(already wired at the root layout) for user-facing success/error feedback instead of
`alert()` or a new notification system.

## 6. Accessibility conventions already in place — keep them

- `.focus-ring` utility class gives a visible gold focus outline (`outline: 2px solid
  var(--color-accent)`) — apply it to any new interactive element.
- A `.skip-link` ("Skip to main content") is present in the root layout — don't remove it.
- Icons from `lucide-react` are typically paired with `aria-label` on icon-only buttons
  (see the mobile menu toggle in `Header.tsx`) — follow the same pattern for new icon
  buttons.
