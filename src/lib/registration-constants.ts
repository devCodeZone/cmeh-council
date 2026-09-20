/** Session-year options for the registration form, e.g. "2025-2026". Generated
 * relative to the current year so the list never goes stale. */
export function getSessionYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let y = currentYear - 1; y <= currentYear + 1; y++) {
    years.push(`${y}-${y + 1}`);
  }
  return years;
}

export const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

// [PLACEHOLDER] Replace with the council's actual registration categories.
export const REGISTRATION_CATEGORIES = [
  "New Candidate Registration",
  "Practitioner Registration",
  "Institution-Affiliated Registration",
  "Renewal Registration",
];

export const REGISTRATION_TYPES = ["New", "Renewal", "Transfer", "Correction"];

export const HIGHEST_QUALIFICATIONS = [
  "Certificate Course",
  "Diploma",
  "Advanced Diploma",
  "Degree",
  "Post-Graduate Diploma",
  "Other",
];

export const REQUIRED_DOC_TYPES = [
  { key: "photo", label: "Passport-size Photograph", multiple: false, required: true },
  { key: "signature", label: "Signature", multiple: false, required: true },
  { key: "identity_proof", label: "Identity Proof", multiple: false, required: true },
  { key: "qualification_certificate", label: "Qualification Certificate(s)", multiple: true, required: true },
  { key: "marksheet", label: "Mark Sheet(s)", multiple: true, required: false },
  { key: "additional_certificate", label: "Additional Certificate(s)", multiple: true, required: false },
  { key: "other", label: "Other Supporting Document(s)", multiple: true, required: false },
] as const;

export const ACCEPTED_FILE_TYPES = ".jpg,.jpeg,.png,.pdf";
export const MAX_UPLOAD_MB_CLIENT = 10;

export const STEP_LABELS = [
  "Personal Details",
  "Educational Details",
  "Registration Information",
  "Document Upload",
  "Declaration",
  "Review Application",
];
