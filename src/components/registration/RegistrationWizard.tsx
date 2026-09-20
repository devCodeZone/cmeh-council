"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { StepIndicator } from "@/components/registration/StepIndicator";
import { FileUploadField } from "@/components/registration/FileUploadField";
import { useToast } from "@/components/ui/Toast";
import { trackEvent } from "@/lib/analytics";
import { openRazorpayCheckout } from "@/lib/razorpay-client";
import { formatCurrencyINR } from "@/lib/utils";
import {
  GENDER_OPTIONS,
  REGISTRATION_CATEGORIES,
  REGISTRATION_TYPES,
  HIGHEST_QUALIFICATIONS,
  REQUIRED_DOC_TYPES,
} from "@/lib/registration-constants";
import {
  personalDetailsSchema,
  qualificationSchema,
  registrationInfoSchema,
} from "@/lib/validations";

type Personal = {
  fullName: string;
  fathersName: string;
  mothersName: string;
  dob: string;
  gender: string;
  nationality: string;
  mobile: string;
  altMobile: string;
  email: string;
  aadhaarNumber: string;
  addressLine1: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
};

type Qualification = {
  highestQualification: string;
  course: string;
  institute: string;
  boardUniversity: string;
  passingYear: string;
  enrollmentNumber: string;
  additionalQualification: string;
};

type RegistrationInfo = {
  registrationCategory: string;
  courseQualification: string;
  registrationType: string;
  previousRegistrationNumber: string;
  institutionDetails: string;
  experience: string;
};

const emptyPersonal: Personal = {
  fullName: "",
  fathersName: "",
  mothersName: "",
  dob: "",
  gender: "",
  nationality: "Indian",
  mobile: "",
  altMobile: "",
  email: "",
  aadhaarNumber: "",
  addressLine1: "",
  city: "",
  district: "",
  state: "Bihar",
  pincode: "",
};

const emptyQualification: Qualification = {
  highestQualification: "",
  course: "",
  institute: "",
  boardUniversity: "",
  passingYear: "",
  enrollmentNumber: "",
  additionalQualification: "",
};

const emptyRegistration: RegistrationInfo = {
  registrationCategory: "",
  courseQualification: "",
  registrationType: "",
  previousRegistrationNumber: "",
  institutionDetails: "",
  experience: "",
};

export function RegistrationWizard({
  declarationText,
  feeAmount,
  requireAadhaar,
}: {
  declarationText: string;
  feeAmount: number;
  requireAadhaar: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState<Personal>(emptyPersonal);
  const [qualifications, setQualifications] = useState<Qualification[]>([{ ...emptyQualification }]);
  const [registration, setRegistration] = useState<RegistrationInfo>(emptyRegistration);
  const [documents, setDocuments] = useState<Record<string, File[]>>({});
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const totalDocCount = useMemo(() => Object.values(documents).reduce((sum, arr) => sum + arr.length, 0), [documents]);

  function goTo(n: number) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(n);
  }

  function validateStep1() {
    const result = personalDetailsSchema.safeParse(personal);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) errs[String(issue.path[0])] = issue.message;
      if (requireAadhaar && !personal.aadhaarNumber.trim()) errs.aadhaarNumber = "Aadhaar number is required";
      setErrors(errs);
      return false;
    }
    if (requireAadhaar && !personal.aadhaarNumber.trim()) {
      setErrors({ aadhaarNumber: "Aadhaar number is required" });
      return false;
    }
    setErrors({});
    return true;
  }

  function validateStep2() {
    const errs: Record<string, string> = {};
    qualifications.forEach((q, idx) => {
      const result = qualificationSchema.safeParse(q);
      if (!result.success) {
        for (const issue of result.error.issues) errs[`${idx}.${String(issue.path[0])}`] = issue.message;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep3() {
    const result = registrationInfoSchema.safeParse(registration);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  }

  function validateStep4() {
    const errs: Record<string, string> = {};
    for (const doc of REQUIRED_DOC_TYPES) {
      if (doc.required && !(documents[doc.key]?.length)) {
        errs[doc.key] = `${doc.label} is required`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep5() {
    const errs: Record<string, string> = {};
    if (!declarationAccepted) errs.declarationAccepted = "You must confirm the declaration";
    if (!termsAccepted) errs.termsAccepted = "You must agree to the Terms & Privacy Policy";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !validateStep4()) return;
    if (step === 5 && !validateStep5()) return;
    if (step === 1) trackEvent("registration_started");
    goTo(step + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append(
        "payload",
        JSON.stringify({ personal, qualifications, registration, declarationAccepted, termsAccepted })
      );
      for (const [docType, files] of Object.entries(documents)) {
        for (const file of files) fd.append(`file_${docType}`, file);
      }

      const res = await fetch("/api/registration/submit", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        push("error", json.message || "Could not submit your application. Please try again.");
        setSubmitting(false);
        return;
      }

      trackEvent("registration_submitted", { applicationNumber: json.applicationNumber });

      if (json.paymentRequired && json.orderId && json.keyId) {
        trackEvent("payment_initiated");
        await openRazorpayCheckout({
          keyId: json.keyId,
          orderId: json.orderId,
          amount: json.amount,
          applicationId: json.applicationId,
          applicationNumber: json.applicationNumber,
          name: personal.fullName,
          email: personal.email,
          contact: personal.mobile,
          onSuccess: () => {
            trackEvent("payment_successful");
            router.push(`/registration/success?app=${json.applicationNumber}&contact=${encodeURIComponent(personal.email)}`);
          },
          onFailure: () => {
            push("error", "Payment could not be completed. You can retry payment from the Track Application page.");
            router.push(`/track-application?app=${json.applicationNumber}`);
          },
        });
      } else if (json.paymentIssue) {
        push("info", "Your application was saved, but online payment could not be initiated. You can retry payment from the Track Application page.");
        router.push(`/track-application?app=${json.applicationNumber}`);
      } else {
        router.push(`/registration/success?app=${json.applicationNumber}&contact=${encodeURIComponent(personal.email)}`);
      }
    } catch {
      push("error", "Network error while submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <StepIndicator current={step} />

      <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8">
        {step === 1 ? <Step1 personal={personal} setPersonal={setPersonal} errors={errors} requireAadhaar={requireAadhaar} /> : null}
        {step === 2 ? (
          <Step2 qualifications={qualifications} setQualifications={setQualifications} errors={errors} />
        ) : null}
        {step === 3 ? <Step3 registration={registration} setRegistration={setRegistration} errors={errors} /> : null}
        {step === 4 ? <Step4 documents={documents} setDocuments={setDocuments} errors={errors} /> : null}
        {step === 5 ? (
          <Step5
            declarationText={declarationText}
            declarationAccepted={declarationAccepted}
            setDeclarationAccepted={setDeclarationAccepted}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            errors={errors}
          />
        ) : null}
        {step === 6 ? (
          <Step6Review
            personal={personal}
            qualifications={qualifications}
            registration={registration}
            documentCount={totalDocCount}
            feeAmount={feeAmount}
            onEdit={goTo}
          />
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => goTo(step - 1)}
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink px-5 py-2.5 rounded-full border border-brand-border hover:bg-brand-surface-alt focus-ring"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 6 ? (
            <button
              onClick={handleNext}
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-primary px-6 py-2.5 rounded-full hover:bg-brand-primary-dark focus-ring"
            >
              Next <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-accent px-6 py-2.5 rounded-full hover:brightness-95 focus-ring disabled:opacity-60"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitting ? "Submitting..." : feeAmount > 0 ? "Continue to Payment" : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Steps ------------------------------ */

function Field({
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  options?: string[];
  placeholder?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-ink mb-1.5">
        {label} {required ? <span className="text-brand-danger">*</span> : null}
      </label>
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-brand-border px-4 py-2.5 focus-ring bg-white">
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-brand-border px-4 py-2.5 focus-ring"
        />
      )}
      {error ? <p className="text-sm text-brand-danger mt-1">{error}</p> : null}
    </div>
  );
}

function Step1({
  personal,
  setPersonal,
  errors,
  requireAadhaar,
}: {
  personal: Personal;
  setPersonal: (p: Personal) => void;
  errors: Record<string, string>;
  requireAadhaar: boolean;
}) {
  const set = (k: keyof Personal) => (v: string) => setPersonal({ ...personal, [k]: v });
  return (
    <div>
      <h2 className="text-lg font-bold text-brand-ink mb-6">Personal Details</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Applicant Full Name" value={personal.fullName} onChange={set("fullName")} error={errors.fullName} required />
        <Field label="Gender" value={personal.gender} onChange={set("gender")} error={errors.gender} required options={GENDER_OPTIONS} />
        <Field label="Father's Name" value={personal.fathersName} onChange={set("fathersName")} error={errors.fathersName} />
        <Field label="Mother's Name" value={personal.mothersName} onChange={set("mothersName")} error={errors.mothersName} />
        <Field label="Date of Birth" type="date" value={personal.dob} onChange={set("dob")} error={errors.dob} required />
        <Field label="Nationality" value={personal.nationality} onChange={set("nationality")} error={errors.nationality} />
        <Field label="Mobile Number" type="tel" value={personal.mobile} onChange={set("mobile")} error={errors.mobile} required placeholder="10-digit mobile number" />
        <Field label="Alternate Mobile" type="tel" value={personal.altMobile} onChange={set("altMobile")} error={errors.altMobile} />
        <Field label="Email" type="email" value={personal.email} onChange={set("email")} error={errors.email} required />
        <Field label="Aadhaar Number" value={personal.aadhaarNumber} onChange={set("aadhaarNumber")} error={errors.aadhaarNumber} required={requireAadhaar} placeholder={requireAadhaar ? "Required" : "Optional"} />
      </div>
      <h3 className="text-sm font-semibold text-brand-ink mt-6 mb-4">Address</h3>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <Field label="Address" value={personal.addressLine1} onChange={set("addressLine1")} error={errors.addressLine1} required />
        </div>
        <Field label="City" value={personal.city} onChange={set("city")} error={errors.city} required />
        <Field label="District" value={personal.district} onChange={set("district")} error={errors.district} required />
        <Field label="State" value={personal.state} onChange={set("state")} error={errors.state} required />
        <Field label="PIN Code" value={personal.pincode} onChange={set("pincode")} error={errors.pincode} required placeholder="6-digit PIN" />
      </div>
    </div>
  );
}

function Step2({
  qualifications,
  setQualifications,
  errors,
}: {
  qualifications: Qualification[];
  setQualifications: (q: Qualification[]) => void;
  errors: Record<string, string>;
}) {
  function update(idx: number, key: keyof Qualification, value: string) {
    const next = [...qualifications];
    next[idx] = { ...next[idx], [key]: value };
    setQualifications(next);
  }
  return (
    <div>
      <h2 className="text-lg font-bold text-brand-ink mb-6">Educational Details</h2>
      <div className="space-y-6">
        {qualifications.map((q, idx) => (
          <div key={idx} className="rounded-xl border border-brand-border p-5 relative">
            {qualifications.length > 1 ? (
              <button
                type="button"
                onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}
                className="absolute top-4 right-4 text-brand-muted hover:text-brand-danger"
                aria-label="Remove qualification"
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}
            <p className="text-sm font-semibold text-brand-primary mb-4">Qualification {idx + 1}</p>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Highest Qualification" value={q.highestQualification} onChange={(v) => update(idx, "highestQualification", v)} error={errors[`${idx}.highestQualification`]} required options={[...HIGHEST_QUALIFICATIONS]} />
              <Field label="Course" value={q.course} onChange={(v) => update(idx, "course", v)} error={errors[`${idx}.course`]} />
              <Field label="Institute" value={q.institute} onChange={(v) => update(idx, "institute", v)} error={errors[`${idx}.institute`]} required />
              <Field label="Board / University" value={q.boardUniversity} onChange={(v) => update(idx, "boardUniversity", v)} error={errors[`${idx}.boardUniversity`]} required />
              <Field label="Passing Year" value={q.passingYear} onChange={(v) => update(idx, "passingYear", v)} error={errors[`${idx}.passingYear`]} required placeholder="e.g. 2023" />
              <Field label="Enrollment / Roll Number" value={q.enrollmentNumber} onChange={(v) => update(idx, "enrollmentNumber", v)} error={errors[`${idx}.enrollmentNumber`]} />
              <div className="sm:col-span-2">
                <Field label="Additional Qualification" value={q.additionalQualification} onChange={(v) => update(idx, "additionalQualification", v)} error={errors[`${idx}.additionalQualification`]} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setQualifications([...qualifications, { ...emptyQualification }])}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary"
      >
        <Plus className="size-4" /> Add Another Qualification
      </button>
    </div>
  );
}

function Step3({
  registration,
  setRegistration,
  errors,
}: {
  registration: RegistrationInfo;
  setRegistration: (r: RegistrationInfo) => void;
  errors: Record<string, string>;
}) {
  const set = (k: keyof RegistrationInfo) => (v: string) => setRegistration({ ...registration, [k]: v });
  return (
    <div>
      <h2 className="text-lg font-bold text-brand-ink mb-2">Registration Information</h2>
      <p className="text-sm text-brand-muted mb-6">These options are configurable by the council administrator.</p>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Registration Category" value={registration.registrationCategory} onChange={set("registrationCategory")} error={errors.registrationCategory} required options={[...REGISTRATION_CATEGORIES]} />
        <Field label="Registration Type" value={registration.registrationType} onChange={set("registrationType")} error={errors.registrationType} required options={[...REGISTRATION_TYPES]} />
        <Field label="Course / Qualification" value={registration.courseQualification} onChange={set("courseQualification")} error={errors.courseQualification} />
        <Field label="Previous Registration Number" value={registration.previousRegistrationNumber} onChange={set("previousRegistrationNumber")} error={errors.previousRegistrationNumber} placeholder="If applicable" />
        <div className="sm:col-span-2">
          <Field label="Institution Details" value={registration.institutionDetails} onChange={set("institutionDetails")} error={errors.institutionDetails} />
        </div>
        <div className="sm:col-span-2">
          <Field label="Experience" value={registration.experience} onChange={set("experience")} error={errors.experience} placeholder="Briefly describe relevant experience, if any" />
        </div>
      </div>
    </div>
  );
}

function Step4({
  documents,
  setDocuments,
  errors,
}: {
  documents: Record<string, File[]>;
  setDocuments: (d: Record<string, File[]>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-brand-ink mb-2">Document Upload</h2>
      <p className="text-sm text-brand-muted mb-6">Accepted formats: JPG, JPEG, PNG, PDF.</p>
      <div className="grid sm:grid-cols-2 gap-6">
        {REQUIRED_DOC_TYPES.map((doc) => (
          <FileUploadField
            key={doc.key}
            label={doc.label}
            required={doc.required}
            multiple={doc.multiple}
            files={documents[doc.key] || []}
            onChange={(files) => setDocuments({ ...documents, [doc.key]: files })}
            error={errors[doc.key]}
          />
        ))}
      </div>
    </div>
  );
}

function Step5({
  declarationText,
  declarationAccepted,
  setDeclarationAccepted,
  termsAccepted,
  setTermsAccepted,
  errors,
}: {
  declarationText: string;
  declarationAccepted: boolean;
  setDeclarationAccepted: (v: boolean) => void;
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-brand-ink mb-6">Declaration</h2>
      <div className="rounded-xl bg-brand-surface-alt p-5 text-sm text-brand-body leading-relaxed mb-5">{declarationText}</div>
      <label className="flex items-start gap-3 mb-4 cursor-pointer">
        <input type="checkbox" checked={declarationAccepted} onChange={(e) => setDeclarationAccepted(e.target.checked)} className="mt-1 size-4" />
        <span className="text-sm text-brand-ink">
          I confirm that the information provided in this application is true and correct to the best of my knowledge.
        </span>
      </label>
      {errors.declarationAccepted ? <p className="text-sm text-brand-danger mb-4">{errors.declarationAccepted}</p> : null}

      <label className="flex items-start gap-3 mb-2 cursor-pointer">
        <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 size-4" />
        <span className="text-sm text-brand-ink">
          I agree to the{" "}
          <a href="/terms-conditions" target="_blank" className="text-brand-primary underline">
            Terms &amp; Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" className="text-brand-primary underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>
      {errors.termsAccepted ? <p className="text-sm text-brand-danger">{errors.termsAccepted}</p> : null}
    </div>
  );
}

function Step6Review({
  personal,
  qualifications,
  registration,
  documentCount,
  feeAmount,
  onEdit,
}: {
  personal: Personal;
  qualifications: Qualification[];
  registration: RegistrationInfo;
  documentCount: number;
  feeAmount: number;
  onEdit: (step: number) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-brand-ink mb-6">Review Application</h2>
      <div className="space-y-6">
        <ReviewSection title="Personal Details" onEdit={() => onEdit(1)}>
          <ReviewGrid
            items={[
              ["Full Name", personal.fullName],
              ["Gender", personal.gender],
              ["Date of Birth", personal.dob],
              ["Mobile", personal.mobile],
              ["Email", personal.email],
              ["Address", `${personal.addressLine1}, ${personal.city}, ${personal.district}, ${personal.state} - ${personal.pincode}`],
            ]}
          />
        </ReviewSection>
        <ReviewSection title="Educational Details" onEdit={() => onEdit(2)}>
          {qualifications.map((q, idx) => (
            <ReviewGrid
              key={idx}
              items={[
                ["Highest Qualification", q.highestQualification],
                ["Institute", q.institute],
                ["Board / University", q.boardUniversity],
                ["Passing Year", q.passingYear],
              ]}
            />
          ))}
        </ReviewSection>
        <ReviewSection title="Registration Information" onEdit={() => onEdit(3)}>
          <ReviewGrid
            items={[
              ["Category", registration.registrationCategory],
              ["Type", registration.registrationType],
              ["Course / Qualification", registration.courseQualification || "—"],
            ]}
          />
        </ReviewSection>
        <ReviewSection title="Documents" onEdit={() => onEdit(4)}>
          <p className="text-sm text-brand-body">{documentCount} document(s) attached.</p>
        </ReviewSection>
        <div className="rounded-xl bg-brand-primary-light p-5 flex items-center justify-between">
          <span className="font-semibold text-brand-ink">Registration Fee</span>
          <span className="font-bold text-brand-primary text-lg">{feeAmount > 0 ? formatCurrencyINR(feeAmount) : "Not yet configured"}</span>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-brand-ink">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary">
          <Pencil className="size-3.5" /> Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function ReviewGrid({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid sm:grid-cols-2 gap-3 mb-3 last:mb-0">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wide text-brand-muted">{label}</dt>
          <dd className="text-sm text-brand-ink">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

