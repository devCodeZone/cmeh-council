import PDFDocument from "pdfkit";
import { formatDateTime, formatCurrencyINR, APPLICATION_STATUS_LABELS } from "@/lib/utils";

type AckData = {
  orgName: string;
  applicationNumber: string;
  candidateName: string;
  mobile: string;
  email: string;
  registrationCategory?: string | null;
  status: string;
  submittedAt: Date | string | null;
};

function bufferFromDoc(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function header(doc: PDFKit.PDFDocument, orgName: string, title: string) {
  doc.rect(0, 0, doc.page.width, 90).fill("#0b5d52");
  doc.fillColor("#ffffff").fontSize(18).font("Helvetica-Bold").text(orgName, 50, 30);
  doc.fontSize(11).font("Helvetica").text(title, 50, 55);
  doc.fillColor("#12241f");
  doc.moveDown(4);
}

function footer(doc: PDFKit.PDFDocument) {
  doc
    .fontSize(8)
    .fillColor("#6b7b76")
    .text(
      "This is a system-generated document from Electrohomeopath Council Patna. It confirms receipt of the application referenced above and does not, by itself, constitute registration approval.",
      50,
      doc.page.height - 70,
      { width: doc.page.width - 100 }
    );
}

export async function generateAcknowledgementPdf(data: AckData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  header(doc, data.orgName, "Registration Application — Acknowledgement");

  doc.fontSize(13).font("Helvetica-Bold").text("Application Acknowledgement");
  doc.moveDown(1);

  const rows: [string, string][] = [
    ["Application Reference Number", data.applicationNumber],
    ["Applicant Name", data.candidateName],
    ["Mobile Number", data.mobile],
    ["Email", data.email],
    ["Registration Category", data.registrationCategory || "—"],
    ["Current Status", APPLICATION_STATUS_LABELS[data.status] || data.status],
    ["Submitted On", formatDateTime(data.submittedAt)],
    ["Generated On", formatDateTime(new Date())],
  ];

  doc.font("Helvetica").fontSize(11);
  for (const [label, value] of rows) {
    doc.font("Helvetica-Bold").text(`${label}: `, { continued: true }).font("Helvetica").text(value);
    doc.moveDown(0.4);
  }

  doc.moveDown(1);
  doc
    .fontSize(10)
    .fillColor("#3f4c48")
    .text(
      "Please retain this acknowledgement and your application reference number for future correspondence. You may track your application status at any time using the Track Application page on this website.",
      { width: doc.page.width - 100 }
    );

  footer(doc);
  return bufferFromDoc(doc);
}

type ReceiptData = {
  orgName: string;
  applicationNumber: string;
  candidateName: string;
  amount: number;
  currency: string;
  provider: string;
  paymentId?: string | null;
  orderId?: string | null;
  status: string;
  paidAt: Date | string | null;
};

export async function generatePaymentReceiptPdf(data: ReceiptData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  header(doc, data.orgName, "Payment Receipt");

  doc.fontSize(13).font("Helvetica-Bold").text("Payment Receipt");
  doc.moveDown(1);

  const rows: [string, string][] = [
    ["Application Reference Number", data.applicationNumber],
    ["Applicant Name", data.candidateName],
    ["Amount Paid", formatCurrencyINR(data.amount)],
    ["Currency", data.currency],
    ["Payment Gateway", data.provider],
    ["Payment ID", data.paymentId || "—"],
    ["Order ID", data.orderId || "—"],
    ["Payment Status", data.status],
    ["Paid On", formatDateTime(data.paidAt)],
    ["Generated On", formatDateTime(new Date())],
  ];

  doc.font("Helvetica").fontSize(11);
  for (const [label, value] of rows) {
    doc.font("Helvetica-Bold").text(`${label}: `, { continued: true }).font("Helvetica").text(value);
    doc.moveDown(0.4);
  }

  doc.moveDown(1);
  doc
    .fontSize(10)
    .fillColor("#3f4c48")
    .text("This receipt confirms the payment recorded against the application referenced above.", { width: doc.page.width - 100 });

  footer(doc);
  return bufferFromDoc(doc);
}
