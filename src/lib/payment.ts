import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Payment gateway wrapper.
 *
 * Razorpay is the default provider. The interface below (createOrder /
 * verifySignature / verifyWebhookSignature) is intentionally provider-agnostic
 * so PayU or Cashfree can be swapped in later without touching call sites —
 * implement the same three functions against their SDKs.
 *
 * Keys are placeholders until real Razorpay credentials are supplied (see
 * .env.example). Card data is never touched by this codebase — Razorpay's
 * Checkout collects it directly and hands back only tokens/IDs.
 */

/** True once real (non-placeholder) Razorpay credentials are configured. */
export function isPaymentGatewayConfigured() {
  const id = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  return Boolean(id && secret && !id.includes("placeholder") && !secret.includes("placeholder"));
}

function getClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  return new Razorpay({ key_id, key_secret });
}

export async function createOrder(params: { amountInPaise: number; receipt: string; notes?: Record<string, string> }) {
  const client = getClient();
  return client.orders.create({
    amount: params.amountInPaise,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });
}

/** Verify the signature returned by Razorpay Checkout after a successful payment. */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return expected === params.signature;
}

/** Verify an incoming Razorpay webhook's `X-Razorpay-Signature` header against the raw body. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export function rupeesToPaise(amountInr: number) {
  return Math.round(amountInr * 100);
}
