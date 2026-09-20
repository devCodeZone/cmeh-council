import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { getApplicationByNumber, contactMatchesApplication } from "@/lib/queries";
import { createOrder, rupeesToPaise, isPaymentGatewayConfigured } from "@/lib/payment";

export async function POST(req: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const body = await req.json().catch(() => ({}));
  const contact = String(body.contact || "");

  const result = await getApplicationByNumber(number.toUpperCase());
  if (!result || !contactMatchesApplication(result.candidate, contact)) {
    return NextResponse.json({ message: "Application not found or contact detail did not match." }, { status: 404 });
  }

  if (result.application.status !== "payment_pending") {
    return NextResponse.json({ message: "This application does not have a pending payment." }, { status: 400 });
  }

  if (!isPaymentGatewayConfigured()) {
    return NextResponse.json({ message: "Online payment is not currently configured. Please contact the council office." }, { status: 503 });
  }

  const amount = Number(result.application.feeAmount || 0);
  const order = await createOrder({
    amountInPaise: rupeesToPaise(amount),
    receipt: `${result.application.applicationNumber}-retry-${Date.now()}`,
    notes: { applicationNumber: result.application.applicationNumber },
  });

  await db.insert(payments).values({
    applicationId: result.application.id,
    provider: "razorpay",
    orderId: order.id,
    amount: String(amount),
    status: "created",
    rawPayload: order as unknown as Record<string, unknown>,
  });

  return NextResponse.json({
    orderId: order.id,
    amount: rupeesToPaise(amount),
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    applicationId: result.application.id,
    applicationNumber: result.application.applicationNumber,
    candidateName: result.candidate.fullName,
    email: result.candidate.email,
    mobile: result.candidate.mobile,
  });
}
