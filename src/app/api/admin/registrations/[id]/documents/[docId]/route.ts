import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { db } from "@/lib/db";
import { applicationDocuments } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { resolvePrivateFilePath } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const guard = await requireAdminSession("registration_officer");
  if ("error" in guard) return guard.error;

  const { id, docId } = await params;
  const [doc] = await db
    .select()
    .from(applicationDocuments)
    .where(and(eq(applicationDocuments.id, Number(docId)), eq(applicationDocuments.applicationId, Number(id))))
    .limit(1);

  if (!doc) return NextResponse.json({ message: "Document not found." }, { status: 404 });

  try {
    const filePath = resolvePrivateFilePath(doc.filePath);
    const buffer = await fs.readFile(filePath);
    await logAudit({
      action: "registration.document.viewed",
      userId: guard.session.userId,
      userName: guard.session.name,
      entityType: "application_document",
      entityId: doc.id,
    });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${doc.fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ message: "File could not be read from storage." }, { status: 404 });
  }
}
