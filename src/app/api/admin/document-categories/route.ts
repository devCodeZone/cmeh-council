import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { requireAdminSession } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";

export async function GET() {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;
  const rows = await db.select().from(categories).orderBy(categories.name);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;
  const body = await req.json().catch(() => null);
  if (!body?.name || typeof body.name !== "string") {
    return NextResponse.json({ message: "Category name is required." }, { status: 400 });
  }
  const [row] = await db.insert(categories).values({ name: body.name.trim(), slug: slugify(body.name) }).returning();
  return NextResponse.json(row);
}
