import { NextRequest, NextResponse } from "next/server";
import { simpleRegistrationSchema } from "@/lib/validations";
import { ALLOWED_IMAGE_MIME, MAX_UPLOAD_BYTES } from "@/lib/storage";
import { sendMail, newCandidateRegistrationEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export const runtime = "nodejs";

const REGISTRATION_RECIPIENT = "cmehcouncilpatna@gmail.com";

/**
 * Simplified candidate registration: no database, no payment gateway, no
 * document storage. The submitted details and the signature image (if any)
 * are simply emailed to the council. This keeps the whole feature working
 * even when no database is configured, and removes every moving part that
 * isn't needed for "collect these details and email them to us".
 */
export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form submission." }, { status: 400 });
  }

  const raw = {
    sessionYear: String(formData.get("sessionYear") || ""),
    candidateName: String(formData.get("candidateName") || ""),
    fathersName: String(formData.get("fathersName") || ""),
    dob: String(formData.get("dob") || ""),
    nationality: String(formData.get("nationality") || ""),
    religion: String(formData.get("religion") || ""),
    birthPlace: String(formData.get("birthPlace") || ""),
    permanentAddress: String(formData.get("permanentAddress") || ""),
    presentAddress: String(formData.get("presentAddress") || ""),
    identificationMark: String(formData.get("identificationMark") || ""),
  };

  const result = simpleRegistrationSchema.safeParse(raw);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return NextResponse.json({ message: firstIssue?.message || "Please check the form and try again." }, { status: 400 });
  }
  const data = result.data;

  // Signature upload is optional at the schema level but strongly expected —
  // validate it when present rather than requiring it, so a slow/unsupported
  // camera upload on a candidate's phone doesn't block the whole submission.
  const signature = formData.get("signature");
  const attachments: { filename: string; content: Buffer; contentType?: string }[] = [];
  if (signature instanceof File && signature.size > 0) {
    if (!ALLOWED_IMAGE_MIME.includes(signature.type)) {
      return NextResponse.json({ message: "Signature must be a JPG, PNG or WEBP image." }, { status: 400 });
    }
    if (signature.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ message: `Signature file is too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB).` }, { status: 400 });
    }
    const buffer = Buffer.from(await signature.arrayBuffer());
    attachments.push({ filename: signature.name || "signature.jpg", content: buffer, contentType: signature.type });
  }

  const now = new Date();
  const result_ = await sendMail({
    to: REGISTRATION_RECIPIENT,
    subject: "New Candidate Registration",
    html: newCandidateRegistrationEmail({ ...data, submittedAt: formatDateTime(now) }),
    attachments,
  });

  if (!result_.sent) {
    // SMTP isn't configured (or the send failed) — tell the candidate plainly
    // rather than pretending it worked, since nothing was saved anywhere else.
    return NextResponse.json(
      { message: "We couldn't send your registration right now. Please try again shortly, or contact the council directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
