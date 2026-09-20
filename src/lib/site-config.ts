/**
 * Central, editable site configuration.
 *
 * IMPORTANT: Every value marked "[PLACEHOLDER]" is a stand-in written for this
 * build because the real, verified information was not supplied. Replace
 * these through the Admin Dashboard (Settings) once the council confirms the
 * facts — do not publish placeholder legal/recognition claims.
 *
 * At runtime, values here are overridden by rows in the `website_settings`
 * table when present (see src/lib/settings.ts). This file only supplies the
 * safe fallback defaults so the site never crashes with missing config.
 */

export const siteConfig = {
  orgName: "Electrohomeopath Council Patna",
  shortName: "CMEH Council Patna",
  tagline: "Advancing Education, Awareness & Professional Development in Electrohomeopathy",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.cmehcouncilpatna.example",

  // NAP (Name, Address, Phone) — keep consistent everywhere for local SEO.
  address: {
    line1: "Council Office Address, Line 1",
    line2: "Locality / Landmark",
    city: "Patna",
    state: "Bihar",
    pincode: "PIN",
    country: "India",
  },
  phone: "Call - +91-7541069125",
  altPhone: "", // set a second phone number here if the council has one, e.g. "Call - +91-XXXXXXXXXX"
  whatsappNumber: "Chat- 917541069125", // digits only, country code, no + or spaces
  email: "cmehcouncilpatna@gmail.com",
  officeHours: "OPEN- Monday – Saturday, 10:00 AM – 5:00 PM",

  social: {
    facebook: "https://www.facebook.com/profile.php?id=61585428485604",
    instagram: "https://www.instagram.com/cmehcouncilpatna/",
    youtube: "https://www.youtube.com/@cmehcouncilpatna",
    linkedin: "https://www.linkedin.com/in/cmehcouncilpatna-electrohomeopathy/",
  },

  googleMapsEmbedUrl: "https://www.google.com/maps?q=25.5750732,85.092186&z=17&output=embed",
  googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=25.5750732,85.092186",

  registrationFee: {
    amountInr: 1500, // [PLACEHOLDER] set the real application/registration fee (in INR) in Admin → Settings
    note: "[Rs. 1500] Registration fee to be confirmed by the council. Shown here for demonstration only.",
  },

  // Analytics / verification — leave blank until the council supplies real IDs.
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",

  // Legal / recognition — DO NOT change these to affirmative claims without
  // verifiable supporting documents from the organisation. See spec section 5.
  recognitionStatement:
    "[PLACEHOLDER] Electrohomeopath Council Patna's recognition, affiliation and registration status will be published here once verified documentation is available. This section must be completed by an authorised administrator with supporting evidence — no recognition, approval or affiliation should be implied until then.",

  foundingYear: null as number | null, // [PLACEHOLDER] set once confirmed — do not guess

  declarationText:
    "I confirm that the information provided in this application is true and correct to the best of my knowledge. I understand that any false statement or suppression of material fact may lead to rejection of my application or cancellation of registration if discovered later.",

  requireAadhaar: false, // configurable: whether Aadhaar number is mandatory on the registration form

  theme: {
    primary: "#2cccb6", // deep teal — trust / healthcare
    primaryDark: "#049281",
    accent: "#c99a3a", // muted gold — institutional premium accent
    ink: "#073226",
  },
} as const;

export type SiteConfig = typeof siteConfig;
