import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { councilDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { saveFile, deleteFile, ALLOWED_DOCUMENT_MIME } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const [row] = await db.select().from(councilDocuments).where(eq(councilDocuments.id, Number(id))).limit(1);
  if (!row) return NextResponse.json({ message: "Not found." }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("registration_officer");
  if ("error" in guard) return guard.error;
  const { id } = await params;

  const [existing] = await db.select().from(councilDocuments).where(eq(councilDocuments.id, Number(id))).limit(1);
  if (!existing) return NextResponse.json({ message: "Not found." }, { status: 404 });

  const formData = await req.formData();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (formData.has("title")) updates.title = String(formData.get("title"));
  if (formData.has("description")) updates.description = String(formData.get("description"));
  if (formData.has("categoryId")) updates.categoryId = formData.get("categoryId") ? Number(formData.get("categoryId")) : null;
  if (formData.has("publicationDate")) updates.publicationDate = String(formData.get("publicationDate"));
  if (formData.has("isPublished")) updates.isPublished = formData.get("isPublished") === "true";
  if (formData.has("isFeatured")) updates.isFeatured = formData.get("isFeatured") === "true";
  if (formData.has("sortOrder")) updates.sortOrder = Number(formData.get("sortOrder"));

  const file = formData.get("file");
  if (file instanceof File && file.size) {
    if (!ALLOWED_DOCUMENT_MIME.includes(file.type)) {
      return NextResponse.json({ message: "Only PDF, JPG and PNG files are allowed." }, { status: 400 });
    }
    const saved = await saveFile("documents", file);
    await deleteFile(existing.filePath);
    updates.filePath = saved.filePath;
    updates.fileType = saved.mimeType.includes("pdf") ? "pdf" : saved.mimeType.split("/")[1];
    updates.fileSize = saved.fileSize;
  }

  await db.update(councilDocuments).set(updates).where(eq(councilDocuments.id, Number(id)));
  await logAudit({ action: "document.updated", userId: guard.session.userId, userName: guard.session.name, entityType: "council_document", entityId: id });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("registration_officer");
  if ("error" in guard) return guard.error;
  const { id } = await params;

  const [existing] = await db.select().from(councilDocuments).where(eq(councilDocuments.id, Number(id))).limit(1);
  if (!existing) return NextResponse.json({ message: "Not found." }, { status: 404 });

  await db.delete(councilDocuments).where(eq(councilDocuments.id, Number(id)));
  await deleteFile(existing.filePath);
  await logAudit({ action: "document.deleted", userId: guard.session.userId, userName: guard.session.name, entityType: "council_document", entityId: id, details: { title: existing.title } });

  return NextResponse.json({ ok: true });
}
