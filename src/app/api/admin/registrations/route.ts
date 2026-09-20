import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, candidates, payments } from "@/lib/db/schema";
import { and, desc, eq, ilike, or, gte, lte, type SQL } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const guard = await requireAdminSession("registration_officer");
  if ("error" in guard) return guard.error;

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const district = sp.get("district");
  const state = sp.get("state");
  const category = sp.get("category");
  const search = sp.get("search");
  const dateFrom = sp.get("dateFrom");
  const dateTo = sp.get("dateTo");

  const conditions: (SQL | undefined)[] = [];
  if (status) conditions.push(eq(applications.status, status as never));
  if (category) conditions.push(eq(applications.registrationCategory, category));
  if (district) conditions.push(ilike(candidates.district, `%${district}%`));
  if (state) conditions.push(ilike(candidates.state, `%${state}%`));
  if (dateFrom) conditions.push(gte(applications.createdAt, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(applications.createdAt, new Date(dateTo + "T23:59:59")));
  if (search) {
    conditions.push(
      or(
        ilike(candidates.fullName, `%${search}%`),
        ilike(applications.applicationNumber, `%${search}%`),
        ilike(candidates.mobile, `%${search}%`),
        ilike(candidates.email, `%${search}%`)
      )
    );
  }

  const rows = await db
    .select({
      id: applications.id,
      applicationNumber: applications.applicationNumber,
      status: applications.status,
      submittedAt: applications.submittedAt,
      registrationCategory: applications.registrationCategory,
      feeAmount: applications.feeAmount,
      candidateName: candidates.fullName,
      mobile: candidates.mobile,
      email: candidates.email,
      district: candidates.district,
      state: candidates.state,
    })
    .from(applications)
    .innerJoin(candidates, eq(applications.candidateId, candidates.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(applications.createdAt))
    .limit(500);

  const paymentRows = await db.select().from(payments);
  const paymentByApp = new Map<number, (typeof paymentRows)[number]>();
  for (const p of paymentRows) {
    const existing = paymentByApp.get(p.applicationId);
    if (!existing || p.createdAt > existing.createdAt) paymentByApp.set(p.applicationId, p);
  }

  return NextResponse.json(
    rows.map((r) => ({ ...r, paymentStatus: paymentByApp.get(r.id)?.status || "—" }))
  );
}
