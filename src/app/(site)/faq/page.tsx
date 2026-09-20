import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqPageClient } from "@/components/FaqPageClient";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { getPublishedFaqs } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/faq",
    title: "Frequently Asked Questions",
    description: "Answers to common questions about registration, documents, payments and events at Electrohomeopath Council Patna.",
  });
}

export default async function FaqPage() {
  const items = await getPublishedFaqs();

  return (
    <>
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <section className="py-16">
        <div className="container-page max-w-3xl">
          <SectionHeading as="h1" eyebrow="Questions" title="Frequently Asked Questions" />
          <div className="mt-12">
            <FaqPageClient items={items} />
          </div>
        </div>
      </section>
      {items.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }}
        />
      ) : null}
    </>
  );
}
