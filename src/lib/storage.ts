import { put, del } from "@vercel/blob";
import crypto from "crypto";
import path from "path";

/**
 * File storage abstraction.
 *
 * Uses Vercel Blob (https://vercel.com/docs/storage/vercel-blob) so uploads
 * work on Vercel's serverless functions, which have a READ-ONLY filesystem
 * (writing to public/uploads or any local folder throws at runtime there,
 * even though it works fine in local `next dev`). This was the cause of
 * "error uploading document" once the site moved off local hosting onto
 * Vercel — every upload attempt tried to write a file to disk and failed.
 *
 * Requires a `BLOB_READ_WRITE_TOKEN` environment variable. In the Vercel
 * dashboard: Project -> Storage -> Create Database -> Blob, then connect it
 * to this project — Vercel adds the token automatically. For local
 * development, pull it into .env with `vercel env pull .env` (or copy the
 * token shown in the Blob store's ".env.local" tab in the dashboard).
 */

export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024;

export const ALLOWED_DOCUMENT_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function safeExt(filename: string) {
  const ext = path.extname(filename).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return ext || "";
}

function assertBlobConfigured() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "File storage isn't configured yet: BLOB_READ_WRITE_TOKEN is missing. In the Vercel dashboard, go to Project -> Storage -> Create Database -> Blob, connect it to this project, then redeploy."
    );
  }
}

export async function saveFile(bucket: string, file: File): Promise<{
  filePath: string; // full public URL, e.g. https://xyz.public.blob.vercel-storage.com/documents/....pdf
  fileName: string;
  mimeType: string;
  fileSize: number;
}> {
  assertBlobConfigured();
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds maximum allowed size of ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);
  }

  const unique = crypto.randomBytes(8).toString("hex");
  const ext = safeExt(file.name);
  const storedName = `${Date.now()}-${unique}${ext}`;
  const key = `${bucket}/${storedName}`;

  const blob = await put(key, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || undefined,
  });

  return {
    filePath: blob.url,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
  };
}

/**
 * Saves a file for sensitive/private data (candidate ID proofs, certificates,
 * signatures). Vercel Blob doesn't currently offer auth-gated ("private")
 * access — every blob has a URL that works for anyone who has it — so the
 * privacy guarantee here comes from the URL never being exposed directly to
 * the browser: it's long/unguessable, and it's stored as `storageKey`
 * (returned here) rather than rendered as a link. It must only ever be
 * resolved and streamed to the client from inside an authenticated route
 * handler (see `resolvePrivateFileUrl`), the same way the old filesystem
 * version worked.
 */
export async function savePrivateFile(bucket: string, file: File): Promise<{
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}> {
  assertBlobConfigured();
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds maximum allowed size of ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);
  }

  const unique = crypto.randomBytes(8).toString("hex");
  const ext = safeExt(file.name);
  const storedName = `${Date.now()}-${unique}${ext}`;
  const key = `private/${bucket}/${storedName}`;

  const blob = await put(key, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || undefined,
  });

  // The blob's own URL is the only way to fetch it later, so it has to be
  // what we persist as storageKey now, even though the field name predates
  // the Blob migration (it used to be a local relative path).
  return {
    storageKey: blob.url,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
  };
}

/**
 * Resolves a storageKey (a full blob URL, or a legacy local relative path
 * from before this migration) into a Response ready to stream back to an
 * authenticated caller. Legacy paths from before the Blob migration will no
 * longer resolve — those files lived on the old server's disk and were lost
 * when the project moved to Vercel; there's no way to recover them here.
 */
export async function resolvePrivateFileResponse(storageKey: string): Promise<Response> {
  if (!storageKey.startsWith("http://") && !storageKey.startsWith("https://")) {
    throw new Error("This file was uploaded before the site moved to its current hosting and is no longer available.");
  }
  const res = await fetch(storageKey);
  if (!res.ok) {
    throw new Error("File not found in storage.");
  }
  return res;
}

/**
 * @deprecated kept only so older code that imported the pre-Blob-migration
 * `resolvePrivateFilePath` (which returned a local filesystem path) still
 * compiles. Local file storage no longer exists on this deployment — any
 * code path still calling this will throw at runtime. Use
 * `resolvePrivateFileResponse` instead.
 */
export function resolvePrivateFilePath(_storageKey: string): string {
  throw new Error(
    "Local file storage was removed when this project moved to Vercel Blob. Update the caller to use resolvePrivateFileResponse(storageKey) instead."
  );
}

export async function deletePrivateFile(storageKey: string) {
  if (!storageKey.startsWith("http://") && !storageKey.startsWith("https://")) return;
  try {
    await del(storageKey);
  } catch {
    // ignore missing file
  }
}

export async function deleteFile(fileUrl: string) {
  if (!fileUrl || !fileUrl.startsWith("http")) return;
  try {
    await del(fileUrl);
  } catch {
    // ignore missing file
  }
}

export { humanFileSize } from "@/lib/utils";
