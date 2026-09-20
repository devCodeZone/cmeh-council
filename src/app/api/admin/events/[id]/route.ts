import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const [row] = await db.select().from(events).where(eq(events.id, Number(id)));
  if (!row) return NextResponse.json({ message: "Not found." }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  if (!body.title || !body.startDate) {
    return NextResponse.json({ message: "Title and start date are required." }, { status: 400 });
  }

  const [existing] = await db.select().from(events).where(eq(events.id, Number(id)));
  if (!existing) return NextResponse.json({ message: "Not found." }, { status: 404 });

  await db
    .update(events)
    .set({
      title: body.title,
      slug: body.slug ? slugify(body.slug) : existing.slug,
      description: body.description || null,
      startDate: body.startDate,
      endDate: body.endDate || null,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      venue: body.venue || null,
      googleMapsUrl: body.googleMapsUrl || null,
      featuredImage: body.featuredImage || null,
      galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : existing.galleryImages,
      contactInfo: body.contactInfo || null,
      registrationUrl: body.registrationUrl || null,
      status: body.status === "published" ? "published" : "draft",
      seoTitle: body.seoTitle || null,
      metaDescription: body.metaDescription || null,
      updatedAt: new Date(),
    })
    .where(eq(events.id, Number(id)));

  await logAudit({ action: "event.updated", userId: guard.session.userId, userName: guard.session.name, entityType: "event", entityId: Number(id) });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  await db.delete(events).where(eq(events.id, Number(id)));
  await logAudit({ action: "event.deleted", userId: guard.session.userId, userName: guard.session.name, entityType: "event", entityId: Number(id) });

  return NextResponse.json({ ok: true });
}
