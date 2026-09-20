import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

export async function GET() {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const rows = await db.select().from(events).orderBy(desc(events.startDate));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  if (!body.title || !body.startDate) {
    return NextResponse.json({ message: "Title and start date are required." }, { status: 400 });
  }

  const slugBase = body.slug ? slugify(body.slug) : slugify(body.title);

  const [row] = await db
    .insert(events)
    .values({
      title: body.title,
      slug: slugBase,
      description: body.description || null,
      startDate: body.startDate,
      endDate: body.endDate || null,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      venue: body.venue || null,
      googleMapsUrl: body.googleMapsUrl || null,
      featuredImage: body.featuredImage || null,
      galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : [],
      contactInfo: body.contactInfo || null,
      registrationUrl: body.registrationUrl || null,
      status: body.status === "published" ? "published" : "draft",
      seoTitle: body.seoTitle || null,
      metaDescription: body.metaDescription || null,
    })
    .returning();

  await logAudit({ action: "event.created", userId: guard.session.userId, userName: guard.session.name, entityType: "event", entityId: row.id, details: { title: row.title } });

  return NextResponse.json(row);
}
