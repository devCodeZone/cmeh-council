import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * File storage abstraction.
 *
 * Default implementation writes to the local filesystem under
 * `public/uploads/<bucket>/...` so files are directly served by Next.js —
 * fine for a single-instance deployment or demo. For production at scale,
 * swap the body of `saveFile` / `deleteFile` for calls to S3, Supabase
 * Storage, or Cloudinary; the call sites (API routes) don't need to change
 * since they only deal with the returned public path.
 */

const UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");
// Candidate documents (ID proof, certificates, photos, signatures) are
// sensitive personal data and must NOT be served as static files — anyone
// with the URL could otherwise fetch them with no authentication. They are
// stored outside `public/` and only ever reach the browser through the
// authenticated route handlers under /api/admin/.../documents/[docId].
const PRIVATE_ROOT = process.env.PRIVATE_UPLOADS_DIR || path.join(process.cwd(), "private-uploads");
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

export async function saveFile(bucket: string, file: File): Promise<{
  filePath: string; // public path, e.g. /uploads/documents/xyz.pdf
  fileName: string;
  mimeType: string;
  fileSize: number;
}> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds maximum allowed size of ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);
  }
  const bucketDir = path.join(/* turbopackIgnore: true */ UPLOADS_ROOT, bucket);
  await fs.mkdir(bucketDir, { recursive: true });

  const unique = crypto.randomBytes(8).toString("hex");
  const ext = safeExt(file.name);
  const storedName = `${Date.now()}-${unique}${ext}`;
  const fullPath = path.join(bucketDir, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  const publicPath = `/uploads/${bucket}/${storedName}`.replace(/\\/g, "/");
  return {
    filePath: publicPath,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
  };
}

/**
 * Saves a file to the private (non-web-served) storage root. Returns a
 * `storageKey` — an internal relative path, NOT a URL — that must be
 * resolved with `resolvePrivateFilePath` inside an authenticated route
 * handler before it is streamed to a client.
 */
export async function savePrivateFile(bucket: string, file: File): Promise<{
  storageKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File exceeds maximum allowed size of ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);
  }
  const bucketDir = path.join(/* turbopackIgnore: true */ PRIVATE_ROOT, bucket);
  await fs.mkdir(bucketDir, { recursive: true });

  const unique = crypto.randomBytes(8).toString("hex");
  const ext = safeExt(file.name);
  const storedName = `${Date.now()}-${unique}${ext}`;
  const fullPath = path.join(bucketDir, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return {
    storageKey: `${bucket}/${storedName}`,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
  };
}

/** Resolves a storageKey to an absolute filesystem path, guarding against path traversal. */
export function resolvePrivateFilePath(storageKey: string) {
  const normalized = path.normalize(storageKey).replace(/^(\.\.[/\\])+/, "");
  const fullPath = path.join(/* turbopackIgnore: true */ PRIVATE_ROOT, normalized);
  if (!fullPath.startsWith(PRIVATE_ROOT)) {
    throw new Error("Invalid storage key.");
  }
  return fullPath;
}

export async function deletePrivateFile(storageKey: string) {
  try {
    await fs.unlink(resolvePrivateFilePath(storageKey));
  } catch {
    // ignore missing file
  }
}

export async function deleteFile(publicPath: string) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return;
  const fullPath = path.join(process.cwd(), "public", publicPath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // ignore missing file
  }
}

export { humanFileSize } from "@/lib/utils";
