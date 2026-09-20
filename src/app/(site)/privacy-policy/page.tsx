import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { LegalPageShell, LegalSection } from "@/components/site/LegalPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/privacy-policy",
    title: "Privacy Policy",
    description: "How Electrohomeopath Council Patna collects, uses and protects personal information submitted through this website.",
  });
}

export default async function PrivacyPolicyPage() {
  const settings = await getSettings();

  return (
    <LegalPageShell
      title="Privacy Policy"
      effectiveDate="[PLACEHOLDER — set the date this policy takes effect]"
      intro={`This Privacy Policy explains how ${settings.orgName} ("the Council", "we", "us") collects, uses, stores and protects information submitted through this website, including the online candidate registration portal.`}
    >
      <LegalSection title="1. Information We Collect">
        <p>We may collect the following categories of information when you use this website:</p>
        <p>
          <strong>Registration information:</strong> name, date of birth, gender, contact number, email address, postal address, category, registration type, qualification
          details and any identifiers you choose to submit (for example, [PLACEHOLDER — specify if Aadhaar or another ID is collected]).
        </p>
        <p>
          <strong>Documents:</strong> photograph, signature, identity proof, qualification certificates, mark sheets and any additional certificates you upload during
          registration. These are stored securely and are not made publicly accessible.
        </p>
        <p>
          <strong>Payment information:</strong> if a registration fee applies, payments are processed by our third-party payment gateway (Razorpay). We do not store your
          card, UPI or bank credentials on our servers — only the payment status, order reference and amount are recorded.
        </p>
        <p>
          <strong>Contact form and enquiries:</strong> name, mobile number, email address, subject and message when you contact us through the website.
        </p>
        <p>
          <strong>Usage data:</strong> if analytics is enabled (Google Analytics), we may collect anonymised usage data such as pages visited, device type and general
          location, to help us improve the website.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p>
          Information collected is used to process candidate registrations and applications, verify submitted documents, communicate updates about application status,
          respond to enquiries submitted through the contact form, process registration fee payments where applicable, and maintain records required for administrative
          and audit purposes. We do not sell or rent personal information to third parties.
        </p>
      </LegalSection>

      <LegalSection title="3. Document & Data Security">
        <p>
          Uploaded identity and qualification documents are stored in a private, access-controlled location on our servers and are not served as public web pages. Access
          to candidate documents is restricted to authorised council administrators who require it to process your application, and each access is logged.
        </p>
      </LegalSection>

      <LegalSection title="4. Third-Party Services">
        <p>
          We use the following third-party service providers, each governed by their own privacy policy: Razorpay (payment processing), an email/SMS service provider for
          transactional notifications [PLACEHOLDER — name the confirmed provider], and Google Analytics for anonymised website usage statistics (only if enabled by the
          administrator).
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies">
        <p>
          This website uses a minimal set of cookies necessary for administrator authentication and, where enabled, analytics cookies. You can control cookies through
          your browser settings; disabling them may affect certain features such as the admin dashboard.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Retention">
        <p>
          Registration and application records are retained for as long as necessary to fulfil the purposes described in this policy and to comply with applicable legal,
          regulatory or administrative requirements. [PLACEHOLDER — specify the exact retention period once confirmed by the council.]
        </p>
      </LegalSection>

      <LegalSection title="7. Your Rights">
        <p>
          You may request access to, correction of, or deletion of the personal information you have submitted, subject to our legal and administrative obligations to
          retain certain records. To make such a request, contact us using the details below.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised effective date.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          For questions about this Privacy Policy or to exercise your data rights, contact us at {settings.email} or {settings.phone}, {settings.address.line1},{" "}
          {settings.address.city}, {settings.address.state} {settings.address.pincode}, {settings.address.country}.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
