import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { LegalPageShell, LegalSection } from "@/components/site/LegalPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/terms-conditions",
    title: "Terms & Conditions",
    description: "Terms and conditions governing the use of the Electrohomeopath Council Patna website and online registration portal.",
  });
}

export default async function TermsConditionsPage() {
  const settings = await getSettings();

  return (
    <LegalPageShell
      title="Terms & Conditions"
      effectiveDate="[PLACEHOLDER — set the date these terms take effect]"
      intro={`These Terms & Conditions govern your use of the ${settings.orgName} website, including the online candidate registration portal. By using this website, you agree to these terms.`}
    >
      <LegalSection title="1. Use of This Website">
        <p>
          This website is provided for the purpose of sharing information about {settings.orgName} and enabling eligible candidates to submit registration applications
          online. You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use of, this
          website by any third party.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility & Accuracy of Information">
        <p>
          Applicants are responsible for ensuring that all information and documents submitted through the registration form are true, accurate, current and complete.
          Submission of false, misleading or fraudulent information may result in rejection of the application, cancellation of registration, or other action as the
          council deems appropriate. Eligibility criteria for registration are as published on this website and are subject to change; [PLACEHOLDER — confirm and
          publish final eligibility criteria].
        </p>
      </LegalSection>

      <LegalSection title="3. Registration Fees">
        <p>
          Where a registration fee is applicable, the amount payable will be clearly displayed at the time of application. Fees, once paid, are subject to the Refund
          Policy published on this website. The council reserves the right to revise fees at any time; revisions will not apply to applications already submitted and
          paid for.
        </p>
      </LegalSection>

      <LegalSection title="4. No Guarantee of Approval">
        <p>
          Submission of an application and payment of the applicable fee does not guarantee approval of registration. Applications are reviewed by authorised council
          officials and may be approved, rejected, or returned for additional information at the council&rsquo;s discretion.
        </p>
      </LegalSection>

      <LegalSection title="5. Intellectual Property">
        <p>
          All content on this website — including text, graphics, logos and design — is the property of {settings.orgName} unless otherwise stated, and may not be
          reproduced, distributed or used without prior written permission, except for personal, non-commercial reference.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-Party Links & Services">
        <p>
          This website may contain links to third-party websites or use third-party services (such as payment gateways and analytics providers) that are governed by
          their own terms and privacy policies. We are not responsible for the content or practices of third-party websites.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of Liability">
        <p>
          While we take reasonable care to keep information on this website accurate and up to date, {settings.orgName} makes no warranties about the completeness,
          reliability or accuracy of this information and shall not be liable for any loss or damage arising from the use of this website, to the fullest extent
          permitted by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="8. Governing Law & Jurisdiction">
        <p>
          These terms are governed by the laws of India. Any disputes arising out of or in connection with this website shall be subject to the exclusive jurisdiction of
          the courts at {settings.address.city}, {settings.address.state}.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to These Terms">
        <p>We may revise these Terms & Conditions at any time. Continued use of the website after changes are posted constitutes acceptance of the revised terms.</p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          For questions about these Terms & Conditions, contact us at {settings.email} or {settings.phone}.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
