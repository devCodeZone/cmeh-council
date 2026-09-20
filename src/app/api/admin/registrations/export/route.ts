import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, candidates } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { formatDateTime } from "@/lib/utils";

function csvEscape(value: unknown) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  const guard = await requireAdminSession("registration_officer");
  if ("error" in guard) return guard.error;

  const rows = await db
    .select({
      applicationNumber: applications.applicationNumber,
      status: applications.status,
      candidateName: candidates.fullName,
      mobile: candidates.mobile,
      email: candidates.email,
      district: candidates.district,
      state: candidates.state,
      registrationCategory: applications.registrationCategory,
      feeAmount: applications.feeAmount,
      submittedAt: applications.submittedAt,
    })
    .from(applications)
    .innerJoin(candidates, eq(applications.candidateId, candidates.id))
    .orderBy(desc(applications.createdAt));

  const headers = ["Application Number", "Status", "Candidate Name", "Mobile", "Email", "District", "State", "Category", "Fee Amount", "Submitted On"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.applicationNumber,
        r.status,
        r.candidateName,
        r.mobile,
        r.email,
        r.district,
        r.state,
        r.registrationCategory,
        r.feeAmount,
        formatDateTime(r.submittedAt),
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="registrations-export-${Date.now()}.csv"`,
    },
  });
}
