import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyWebhookSignature } from "@/lib/payment";
import { logAudit } from "@/lib/audit";

/**
 * Razorpay webhook — the source of truth for payment state. Configure this
 * URL (https://yourdomain.com/api/payment/webhook) and a webhook secret in
 * the Razorpay Dashboard, and set RAZORPAY_WEBHOOK_SECRET to match.
 *
 * Handles: payment.captured, payment.failed, refund.processed.
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ message: "Invalid webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventType = event.event as string;

  try {
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const orderId = event.payload?.payment?.entity?.order_id;
      const paymentId = event.payload?.payment?.entity?.id;
      if (orderId) {
        const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
        if (payment && payment.status !== "successful") {
          await db.update(payments).set({ status: "successful", paymentId, rawPayload: event, updatedAt: new Date() }).where(eq(payments.id, payment.id));
          await db.update(applications).set({ status: "under_review", updatedAt: new Date() }).where(eq(applications.id, payment.applicationId));
          await logAudit({ action: "payment.captured.webhook", entityType: "payment", entityId: payment.id, details: { orderId, paymentId } });
        }
      }
    } else if (eventType === "payment.failed") {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) {
        const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
        if (payment) {
          await db.update(payments).set({ status: "failed", rawPayload: event, updatedAt: new Date() }).where(eq(payments.id, payment.id));
          await logAudit({ action: "payment.failed.webhook", entityType: "payment", entityId: payment.id, details: { orderId } });
        }
      }
    } else if (eventType === "refund.processed") {
      const paymentId = event.payload?.refund?.entity?.payment_id;
      if (paymentId) {
        const [payment] = await db.select().from(payments).where(eq(payments.paymentId, paymentId)).limit(1);
        if (payment) {
          await db.update(payments).set({ status: "refunded", rawPayload: event, updatedAt: new Date() }).where(eq(payments.id, payment.id));
          await logAudit({ action: "payment.refunded.webhook", entityType: "payment", entityId: payment.id });
        }
      }
    }
  } catch (err) {
    console.error("[webhook] processing error:", err);
    // Still return 200 so Razorpay doesn't retry indefinitely once we've logged it.
  }

  return NextResponse.json({ received: true });
}
