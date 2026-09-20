import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { applications, candidates, qualifications, applicationDocuments, payments, applicationStatusValues } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { sendMail, registrationAckEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { formatDateTime } from "@/lib/utils";

async function loadFullApplication(id: number) {
  const [row] = await db
    .select({ application: applications, candidate: candidates })
    .from(applications)
    .innerJoin(candidates, eq(applications.candidateId, candidates.id))
    .where(eq(applications.id, id))
    .limit(1);
  if (!row) return null;

  const [quals, docs, pays] = await Promise.all([
    db.select().from(qualifications).where(eq(qualifications.applicationId, id)).orderBy(asc(qualifications.sortOrder)),
    db.select().from(applicationDocuments).where(eq(applicationDocuments.applicationId, id)),
    db.select().from(payments).where(eq(payments.applicationId, id)),
  ]);

  return { ...row, qualifications: quals, documents: docs, payments: pays };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("registration_officer");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const data = await loadFullApplication(Number(id));
  if (!data) return NextResponse.json({ message: "Application not found." }, { status: 404 });
  return NextResponse.json(data);
}

const updateSchema = z.object({
  status: z.enum(applicationStatusValues).optional(),
  internalNote: z.string().max(4000).optional(),
  notifyCandidate: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("registration_officer");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Invalid update." }, { status: 400 });

  const existing = await loadFullApplication(Number(id));
  if (!existing) return NextResponse.json({ message: "Application not found." }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.internalNote !== undefined) updates.internalNote = parsed.data.internalNote;

  await db.update(applications).set(updates).where(eq(applications.id, Number(id)));

  await logAudit({
    action: "registration.status_changed",
    userId: guard.session.userId,
    userName: guard.session.name,
    entityType: "application",
    entityId: id,
    details: { from: existing.application.status, to: parsed.data.status, note: parsed.data.internalNote },
  });

  if (parsed.data.notifyCandidate && parsed.data.status) {
    const settings = await getSettings();
    await sendMail({
      to: existing.candidate.email,
      subject: `Application Status Update – ${existing.application.applicationNumber}`,
      html: registrationAckEmail({
        candidateName: existing.candidate.fullName,
        applicationNumber: existing.application.applicationNumber,
        paymentStatus: parsed.data.status.replace(/_/g, " "),
        submittedDate: formatDateTime(existing.application.submittedAt),
        trackUrl: `${settings.url}/track-application?app=${existing.application.applicationNumber}`,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
