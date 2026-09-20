import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { formatCurrencyINR } from "@/lib/utils";
import { LegalPageShell, LegalSection } from "@/components/site/LegalPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/refund-policy",
    title: "Refund Policy",
    description: "Refund policy for registration fees paid through the Electrohomeopath Council Patna online registration portal.",
  });
}

export default async function RefundPolicyPage() {
  const settings = await getSettings();
  const feeConfigured = settings.registrationFee.amountInr > 0;

  return (
    <LegalPageShell
      title="Refund Policy"
      effectiveDate="[PLACEHOLDER — set the date this policy takes effect]"
      intro={`This Refund Policy explains how ${settings.orgName} handles refund requests for registration fees paid through this website's online registration portal.`}
    >
      <LegalSection title="1. Current Fee Status">
        <p>
          {feeConfigured
            ? `The current registration fee is ${formatCurrencyINR(settings.registrationFee.amountInr)}. ${settings.registrationFee.note}`
            : "A registration fee has not yet been finalised for this portal. Once a fee is configured by the council, this page will be updated to reflect the applicable refund terms."}
        </p>
      </LegalSection>

      <LegalSection title="2. General Refund Principles">
        <p>
          Registration fees are collected to process and review an application and are, as a general rule, non-refundable once payment has been successfully completed
          and the application has entered review. [PLACEHOLDER — confirm and publish the council&rsquo;s final refund conditions, including any circumstances under
          which a full or partial refund may be granted, such as duplicate payment or a technical error on our end.]
        </p>
      </LegalSection>

      <LegalSection title="3. Duplicate or Failed Payments">
        <p>
          If a payment is deducted from your account but the registration was not confirmed (for example, due to a payment gateway or network error), or if you were
          charged more than once for the same application, please contact us with your payment reference and application number so we can investigate and process a
          refund of the excess or duplicate amount where confirmed. [PLACEHOLDER — specify the expected refund processing timeframe, e.g. 7–14 business days.]
        </p>
      </LegalSection>

      <LegalSection title="4. How to Request a Refund">
        <p>
          To request a refund review, email us at {settings.email} or use the Contact page, quoting your application number, the payment reference/transaction ID, and a
          description of the issue. We will acknowledge your request and respond after reviewing the payment and application records.
        </p>
      </LegalSection>

      <LegalSection title="5. Refund Method">
        <p>
          Approved refunds, where applicable, are processed to the original payment method used at the time of payment, via our payment gateway (Razorpay).
          [PLACEHOLDER — confirm the typical time for the refund to reflect in the payer&rsquo;s account.]
        </p>
      </LegalSection>

      <LegalSection title="6. Changes to This Policy">
        <p>We may update this Refund Policy from time to time. The updated version will be posted on this page with a revised effective date.</p>
      </LegalSection>
    </LegalPageShell>
  );
}
