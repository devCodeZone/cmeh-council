import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { LegalPageShell, LegalSection } from "@/components/site/LegalPageShell";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/disclaimer",
    title: "Disclaimer",
    description: "Important disclaimers regarding recognition status, content accuracy and use of the Electrohomeopath Council Patna website.",
  });
}

export default async function DisclaimerPage() {
  const settings = await getSettings();

  return (
    <LegalPageShell
      title="Disclaimer"
      effectiveDate="[PLACEHOLDER — set the date this disclaimer takes effect]"
      intro={`Please read this disclaimer carefully before using the ${settings.orgName} website.`}
    >
      <LegalSection title="1. No Claim of Government Recognition Without Verification">
        <p>
          {settings.recognitionStatement}
        </p>
        <p>
          Nothing on this website should be interpreted as a claim of statutory recognition, government approval, or official medical council affiliation unless it is
          explicitly stated with supporting, verifiable documentation published by an authorised council administrator.
        </p>
      </LegalSection>

      <LegalSection title="2. Not a Substitute for Medical Advice">
        <p>
          Content on this website relating to Electrohomeopathy, education or health-related topics is provided for general informational and educational purposes only.
          It is not intended as, and should not be relied upon as, medical advice, diagnosis or treatment. Always seek the advice of a qualified healthcare provider with
          any questions regarding a medical condition.
        </p>
      </LegalSection>

      <LegalSection title="3. Accuracy of Information">
        <p>
          While we make reasonable efforts to keep the information on this website accurate and current, certain details (including address, contact numbers, fees, and
          founding history) are marked as placeholders pending verification by the council and should not be relied upon until confirmed. We do not guarantee the
          completeness, reliability or timeliness of any information published here.
        </p>
      </LegalSection>

      <LegalSection title="4. External Links">
        <p>
          This website may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness or
          completeness of any information on these external websites and are not responsible for their content.
        </p>
      </LegalSection>

      <LegalSection title="5. Limitation of Liability">
        <p>
          {settings.orgName} shall not be held liable for any loss, damage or inconvenience arising from reliance on information published on this website, to the
          fullest extent permitted by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          If you have questions about this disclaimer, contact us at {settings.email} or {settings.phone}.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
