import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, payments, candidates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPaymentSignature } from "@/lib/payment";
import { sendMail, registrationAckEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

/**
 * Called client-side immediately after Razorpay Checkout returns a
 * successful payment. This is a convenience path for fast UI feedback —
 * the webhook below is the source of truth for payment state and should
 * remain enabled in production so that state is correct even if the user
 * closes the browser before this call completes.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request." }, { status: 400 });

  const { applicationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
    applicationId: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  };

  if (!applicationId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ message: "Missing payment details." }, { status: 400 });
  }

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    return NextResponse.json({ message: "Payment signature verification failed." }, { status: 400 });
  }

  const [application] = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
  if (!application) return NextResponse.json({ message: "Application not found." }, { status: 404 });

  await db
    .update(payments)
    .set({ paymentId: razorpay_payment_id, signature: razorpay_signature, status: "successful", updatedAt: new Date() })
    .where(eq(payments.orderId, razorpay_order_id));

  await db.update(applications).set({ status: "under_review", updatedAt: new Date() }).where(eq(applications.id, applicationId));

  const [candidate] = await db.select().from(candidates).where(eq(candidates.id, application.candidateId)).limit(1);
  const settings = await getSettings();
  if (candidate) {
    await sendMail({
      to: candidate.email,
      subject: "Application Received – Electrohomeopath Council Patna",
      html: registrationAckEmail({
        candidateName: candidate.fullName,
        applicationNumber: application.applicationNumber,
        paymentStatus: "Payment Completed",
        submittedDate: formatDateTime(application.submittedAt || new Date()),
        trackUrl: `${settings.url}/track-application?app=${application.applicationNumber}`,
      }),
    });
  }

  return NextResponse.json({ ok: true, applicationNumber: application.applicationNumber });
}
