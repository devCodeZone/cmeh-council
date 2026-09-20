import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { applications, candidates, qualifications, applicationDocuments, payments } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { RegistrationStatusPanel } from "@/components/admin/RegistrationStatusPanel";
import { formatDate, formatDateTime, formatCurrencyINR, humanFileSize } from "@/lib/utils";
import { REQUIRED_DOC_TYPES } from "@/lib/registration-constants";

export default async function RegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const applicationId = Number(id);

  const [row] = await db
    .select({ application: applications, candidate: candidates })
    .from(applications)
    .innerJoin(candidates, eq(applications.candidateId, candidates.id))
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!row) notFound();

  const [quals, docs, pays] = await Promise.all([
    db.select().from(qualifications).where(eq(qualifications.applicationId, applicationId)).orderBy(asc(qualifications.sortOrder)),
    db.select().from(applicationDocuments).where(eq(applicationDocuments.applicationId, applicationId)),
    db.select().from(payments).where(eq(payments.applicationId, applicationId)),
  ]);

  const docLabel = (key: string) => REQUIRED_DOC_TYPES.find((d) => d.key === key)?.label || key;

  return (
    <div>
      <Link href="/admin/registrations" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary mb-4">
        <ArrowLeft className="size-4" /> Back to Registrations
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">{row.application.applicationNumber}</h1>
          <p className="text-brand-muted text-sm">Submitted {formatDateTime(row.application.submittedAt)}</p>
        </div>
        <a
          href={`/api/registration/${row.application.applicationNumber}/acknowledgement?contact=${encodeURIComponent(row.candidate.email)}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary"
        >
          <ExternalLink className="size-4" /> View Acknowledgement PDF
        </a>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Personal Details">
            <Grid
              items={[
                ["Full Name", row.candidate.fullName],
                ["Father's Name", row.candidate.fathersName || "—"],
                ["Mother's Name", row.candidate.mothersName || "—"],
                ["Date of Birth", formatDate(row.candidate.dob)],
                ["Gender", row.candidate.gender || "—"],
                ["Nationality", row.candidate.nationality || "—"],
                ["Mobile", row.candidate.mobile],
                ["Alt. Mobile", row.candidate.altMobile || "—"],
                ["Email", row.candidate.email],
                ["Aadhaar", row.candidate.aadhaarNumber || "—"],
                ["Address", `${row.candidate.addressLine1}, ${row.candidate.city}, ${row.candidate.district}, ${row.candidate.state} - ${row.candidate.pincode}`],
              ]}
            />
          </Section>

          <Section title="Educational Details">
            {quals.map((q) => (
              <Grid
                key={q.id}
                items={[
                  ["Highest Qualification", q.highestQualification || "—"],
                  ["Course", q.course || "—"],
                  ["Institute", q.institute || "—"],
                  ["Board / University", q.boardUniversity || "—"],
                  ["Passing Year", q.passingYear || "—"],
                  ["Enrollment No.", q.enrollmentNumber || "—"],
                ]}
              />
            ))}
          </Section>

          <Section title="Registration Information">
            <Grid
              items={[
                ["Category", row.application.registrationCategory || "—"],
                ["Type", row.application.registrationType || "—"],
                ["Course / Qualification", row.application.courseQualification || "—"],
                ["Previous Reg. Number", row.application.previousRegistrationNumber || "—"],
                ["Institution Details", row.application.institutionDetails || "—"],
                ["Experience", row.application.experience || "—"],
              ]}
            />
          </Section>

          <Section title="Documents">
            {docs.length ? (
              <ul className="divide-y divide-brand-border">
                {docs.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-2 text-sm text-brand-ink">
                      <FileText className="size-4 text-brand-primary" />
                      {docLabel(doc.docType)} — {doc.fileName}
                      <span className="text-xs text-brand-muted">({humanFileSize(doc.fileSize)})</span>
                    </span>
                    <a
                      href={`/api/admin/registrations/${applicationId}/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand-primary"
                    >
                      View / Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-brand-muted">No documents uploaded.</p>
            )}
          </Section>

          <Section title="Payment History">
            {pays.length ? (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-brand-muted text-left">
                  <tr>
                    <th className="py-2">Order ID</th>
                    <th className="py-2">Payment ID</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {pays.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2">{p.orderId || "—"}</td>
                      <td className="py-2">{p.paymentId || "—"}</td>
                      <td className="py-2">{formatCurrencyINR(p.amount)}</td>
                      <td className="py-2 capitalize">{p.status}</td>
                      <td className="py-2">{formatDateTime(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-brand-muted">No payment records.</p>
            )}
          </Section>
        </div>

        <div>
          <RegistrationStatusPanel applicationId={applicationId} currentStatus={row.application.status} currentNote={row.application.internalNote} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-6">
      <h2 className="font-semibold text-brand-ink mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid sm:grid-cols-2 gap-4 mb-4 last:mb-0">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wide text-brand-muted">{label}</dt>
          <dd className="text-sm text-brand-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
