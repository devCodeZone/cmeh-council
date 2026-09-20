import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { requireAdminSession } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdminSession("super_admin");
  if ("error" in guard) return guard.error;

  const rows = await db.select().from(roles).orderBy(roles.id);
  return NextResponse.json(rows);
}
