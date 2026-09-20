import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, applications, candidates } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdminSession("accountant");
  if ("error" in guard) return guard.error;

  const rows = await db
    .select({
      id: payments.id,
      applicationNumber: applications.applicationNumber,
      candidateName: candidates.fullName,
      amount: payments.amount,
      provider: payments.provider,
      orderId: payments.orderId,
      paymentId: payments.paymentId,
      status: payments.status,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(applications, eq(payments.applicationId, applications.id))
    .innerJoin(candidates, eq(applications.candidateId, candidates.id))
    .orderBy(desc(payments.createdAt));

  return NextResponse.json(rows);
}
