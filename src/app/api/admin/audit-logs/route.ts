import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdminSession("admin");
  if ("error" in guard) return guard.error;

  const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200);
  return NextResponse.json(rows);
}
