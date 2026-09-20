import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { councilDocuments, categories } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { saveFile, ALLOWED_DOCUMENT_MIME } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const rows = await db
    .select({
      id: councilDocuments.id,
      title: councilDocuments.title,
      slug: councilDocuments.slug,
      description: councilDocuments.description,
      filePath: councilDocuments.filePath,
      fileType: councilDocuments.fileType,
      fileSize: councilDocuments.fileSize,
      publicationDate: councilDocuments.publicationDate,
      isPublished: councilDocuments.isPublished,
      isFeatured: councilDocuments.isFeatured,
      sortOrder: councilDocuments.sortOrder,
      categoryId: councilDocuments.categoryId,
      categoryName: categories.name,
      createdAt: councilDocuments.createdAt,
    })
    .from(councilDocuments)
    .leftJoin(categories, eq(councilDocuments.categoryId, categories.id))
    .orderBy(desc(councilDocuments.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminSession("registration_officer");
  if ("error" in guard) return guard.error;

  const formData = await req.formData();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryId = formData.get("categoryId") ? Number(formData.get("categoryId")) : null;
  const publicationDate = String(formData.get("publicationDate") || new Date().toISOString().slice(0, 10));
  const isPublished = formData.get("isPublished") === "true";
  const isFeatured = formData.get("isFeatured") === "true";
  const file = formData.get("file");

  if (!title) return NextResponse.json({ message: "Title is required." }, { status: 400 });
  if (!(file instanceof File) || !file.size) return NextResponse.json({ message: "A file is required." }, { status: 400 });
  if (!ALLOWED_DOCUMENT_MIME.includes(file.type)) {
    return NextResponse.json({ message: "Only PDF, JPG and PNG files are allowed." }, { status: 400 });
  }

  const saved = await saveFile("documents", file);
  const slugBase = slugify(title);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const [row] = await db
    .insert(councilDocuments)
    .values({
      title,
      slug,
      description,
      categoryId,
      filePath: saved.filePath,
      fileType: saved.mimeType.includes("pdf") ? "pdf" : saved.mimeType.split("/")[1],
      fileSize: saved.fileSize,
      publicationDate,
      isPublished,
      isFeatured,
      uploadedBy: guard.session.userId,
    })
    .returning();

  await logAudit({ action: "document.uploaded", userId: guard.session.userId, userName: guard.session.name, entityType: "council_document", entityId: row.id, details: { title } });

  return NextResponse.json(row);
}
