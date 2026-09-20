import { NextRequest, NextResponse } from "next/server";
import { trackApplicationSchema } from "@/lib/validations";
import { getApplicationByNumber, contactMatchesApplication } from "@/lib/queries";
import { APPLICATION_STATUS_LABELS } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = trackApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Please enter a valid application number and contact detail." }, { status: 400 });
  }

  const result = await getApplicationByNumber(parsed.data.applicationNumber.trim().toUpperCase());
  if (!result || !contactMatchesApplication(result.candidate, parsed.data.contact)) {
    return NextResponse.json({ message: "No matching application found. Please check your details and try again." }, { status: 404 });
  }

  const { application, candidate, payment } = result;

  return NextResponse.json({
    applicationNumber: application.applicationNumber,
    candidateName: candidate.fullName,
    status: application.status,
    statusLabel: APPLICATION_STATUS_LABELS[application.status] || application.status,
    submittedAt: application.submittedAt,
    registrationCategory: application.registrationCategory,
    internalNote: application.status === "info_required" ? application.internalNote : null,
    payment: payment
      ? { status: payment.status, amount: payment.amount, provider: payment.provider }
      : null,
    canRetryPayment: application.status === "payment_pending",
  });
}
