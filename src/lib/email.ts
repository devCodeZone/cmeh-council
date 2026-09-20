import nodemailer from "nodemailer";

/**
 * Email sending wrapper.
 *
 * Configure real SMTP credentials (or swap in Resend/SendGrid) via the
 * SMTP_* environment variables — see .env.example / README.md. Until then,
 * this transport is created but sends will fail gracefully and log to the
 * console so local development and demos are never blocked by missing mail
 * configuration.
 */

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}) {
  const t = getTransporter();
  const from = process.env.MAIL_FROM || "Electrohomeopath Council Patna <no-reply@example.org>";

  if (!t) {
    console.warn(
      `[email] SMTP not configured — skipping real send. Would have sent "${opts.subject}" to ${opts.to}.`
    );
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    await t.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: opts.attachments,
    });
    return { sent: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { sent: false, reason: "send failed" };
  }
}

function emailShell(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f8f7;font-family:Arial,Helvetica,sans-serif;color:#12241f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8f7;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#0b5d52;padding:24px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:bold;">Electrohomeopath Council Patna</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f6f8f7;font-size:12px;color:#6b7b76;">
                This is an automated message from Electrohomeopath Council Patna. Please do not reply directly to this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function contactAdminNotificationEmail(data: {
  fullName: string;
  mobile: string;
  email: string;
  subject?: string;
  message: string;
  submittedAt: string;
}) {
  return emailShell(
    "New Website Enquiry &ndash; Electrohomeopath Council Patna",
    `<p><strong>Name:</strong> ${escapeHtml(data.fullName)}</p>
     <p><strong>Mobile:</strong> ${escapeHtml(data.mobile)}</p>
     <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
     <p><strong>Subject:</strong> ${escapeHtml(data.subject || "—")}</p>
     <p><strong>Message:</strong><br/>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
     <p><strong>Received:</strong> ${escapeHtml(data.submittedAt)}</p>`
  );
}

export function contactUserAckEmail(data: { fullName: string }) {
  return emailShell(
    "We've received your message",
    `<p>Dear ${escapeHtml(data.fullName)},</p>
     <p>Thank you for reaching out to Electrohomeopath Council Patna. We have received your enquiry and our team will get back to you shortly.</p>
     <p>Regards,<br/>Electrohomeopath Council Patna</p>`
  );
}

export function registrationAckEmail(data: {
  candidateName: string;
  applicationNumber: string;
  paymentStatus: string;
  submittedDate: string;
  trackUrl: string;
}) {
  return emailShell(
    "Application Received &ndash; Electrohomeopath Council Patna",
    `<p>Dear ${escapeHtml(data.candidateName)},</p>
     <p>Your online registration application has been received.</p>
     <p><strong>Application Reference Number:</strong> ${escapeHtml(data.applicationNumber)}</p>
     <p><strong>Payment Status:</strong> ${escapeHtml(data.paymentStatus)}</p>
     <p><strong>Submitted On:</strong> ${escapeHtml(data.submittedDate)}</p>
     <p>Please keep this reference number safe — you will need it to track your application status.</p>
     <p style="margin-top:24px;">
       <a href="${data.trackUrl}" style="background:#0b5d52;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Track Application</a>
     </p>
     <p style="margin-top:24px;">Regards,<br/>Electrohomeopath Council Patna</p>`
  );
}

export function newCandidateRegistrationEmail(data: {
  sessionYear: string;
  candidateName: string;
  fathersName: string;
  dob: string;
  nationality: string;
  religion: string;
  birthPlace: string;
  permanentAddress: string;
  presentAddress: string;
  identificationMark: string;
  submittedAt: string;
}) {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6b7b76;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#12241f;font-weight:600;">${escapeHtml(
      value || "—"
    ).replace(/\n/g, "<br/>")}</td></tr>`;

  return emailShell(
    "New Candidate Registration",
    `<p>A new candidate registration has been submitted through the website. The signature image, if provided, is attached to this email.</p>
     <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:12px;">
       ${row("Session Year", data.sessionYear)}
       ${row("Candidate's Name", data.candidateName)}
       ${row("Father's Name", data.fathersName)}
       ${row("Date of Birth", data.dob)}
       ${row("Nationality", data.nationality)}
       ${row("Religion", data.religion)}
       ${row("Birth Place", data.birthPlace)}
       ${row("Permanent Address", data.permanentAddress)}
       ${row("Present Address", data.presentAddress)}
       ${row("Identification Mark", data.identificationMark)}
       ${row("Submitted On", data.submittedAt)}
     </table>`
  );
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
