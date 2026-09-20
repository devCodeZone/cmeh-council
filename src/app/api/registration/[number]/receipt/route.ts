import { NextRequest, NextResponse } from "next/server";
import { getApplicationByNumber, contactMatchesApplication } from "@/lib/queries";
import { generatePaymentReceiptPdf } from "@/lib/pdf";
import { getSettings } from "@/lib/settings";

export async function GET(req: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const contact = req.nextUrl.searchParams.get("contact") || "";

  const result = await getApplicationByNumber(number.toUpperCase());
  if (!result || !contactMatchesApplication(result.candidate, contact)) {
    return NextResponse.json({ message: "Application not found or contact detail did not match." }, { status: 404 });
  }
  if (!result.payment) {
    return NextResponse.json({ message: "No payment record exists for this application yet." }, { status: 404 });
  }

  const settings = await getSettings();
  const pdf = await generatePaymentReceiptPdf({
    orgName: settings.orgName,
    applicationNumber: result.application.applicationNumber,
    candidateName: result.candidate.fullName,
    amount: Number(result.payment.amount),
    currency: result.payment.currency,
    provider: result.payment.provider,
    paymentId: result.payment.paymentId,
    orderId: result.payment.orderId,
    status: result.payment.status,
    paidAt: result.payment.updatedAt,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Payment-Receipt-${result.application.applicationNumber}.pdf"`,
    },
  });
}
