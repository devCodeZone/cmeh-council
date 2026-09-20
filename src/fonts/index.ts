import localFont from "next/font/local";

/**
 * Self-hosted variable fonts (Inter / Manrope), bundled directly in the repo.
 *
 * These replace next/font/google. Google Fonts requires a network call to
 * fonts.googleapis.com at build time, which fails in network-restricted
 * build environments (CI runners, offline builds, some sandboxes) and adds
 * an external dependency for something this simple. Self-hosting removes
 * that failure mode entirely while keeping the same variable-weight fonts,
 * automatic font-display: swap, and zero layout shift behaviour.
 *
 * Files were extracted once from the @fontsource-variable/{inter,manrope}
 * npm packages (SIL Open Font License) and are not modified.
 */
export const bodyFont = localFont({
  src: [
    { path: "./inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./inter-latin-ext-wght-normal.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const headingFont = localFont({
  src: [
    { path: "./manrope-latin-wght-normal.woff2", weight: "200 800", style: "normal" },
    { path: "./manrope-latin-ext-wght-normal.woff2", weight: "200 800", style: "normal" },
  ],
  variable: "--font-heading",
  display: "swap",
});
