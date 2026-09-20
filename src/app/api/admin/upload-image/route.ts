import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-guard";
import { saveFile, ALLOWED_IMAGE_MIME } from "@/lib/storage";

/** Shared image-upload endpoint used by the various content admin forms (testimonials, team, gallery, blog, events). */
export async function POST(req: NextRequest) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const formData = await req.formData();
  const file = formData.get("file");
  const bucket = String(formData.get("bucket") || "images").replace(/[^a-z0-9-]/gi, "");

  if (!(file instanceof File) || !file.size) {
    return NextResponse.json({ message: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
    return NextResponse.json({ message: "Only JPG, PNG and WEBP images are allowed." }, { status: 400 });
  }

  const saved = await saveFile(bucket || "images", file);
  return NextResponse.json({ path: saved.filePath });
}
