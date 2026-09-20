import { NextRequest, NextResponse } from "next/server";
import { getApplicationByNumber, contactMatchesApplication } from "@/lib/queries";
import { generateAcknowledgementPdf } from "@/lib/pdf";
import { getSettings } from "@/lib/settings";

export async function GET(req: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const contact = req.nextUrl.searchParams.get("contact") || "";

  const result = await getApplicationByNumber(number.toUpperCase());
  if (!result || !contactMatchesApplication(result.candidate, contact)) {
    return NextResponse.json({ message: "Application not found or contact detail did not match." }, { status: 404 });
  }

  const settings = await getSettings();
  const pdf = await generateAcknowledgementPdf({
    orgName: settings.orgName,
    applicationNumber: result.application.applicationNumber,
    candidateName: result.candidate.fullName,
    mobile: result.candidate.mobile,
    email: result.candidate.email,
    registrationCategory: result.application.registrationCategory,
    status: result.application.status,
    submittedAt: result.application.submittedAt,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Acknowledgement-${result.application.applicationNumber}.pdf"`,
    },
  });
}
