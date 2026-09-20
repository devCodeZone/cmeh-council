import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InformationsBrowser } from "@/components/InformationsBrowser";
import { buildMetadata } from "@/lib/seo";
import { getAllDocuments, getDocumentCategories } from "@/lib/queries";
import { STATIC_DOCUMENTS } from "@/lib/static-documents";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/informations",
    title: "Informations & Downloads",
    description: "Notices, circulars, guidelines, forms and other official information published by Electrohomeopath Council Patna.",
  });
}

export default async function InformationsPage() {
  const [documents, categories] = await Promise.all([getAllDocuments({}), getDocumentCategories()]);

  return (
    <>
      <Breadcrumbs items={[{ label: "Informations & Downloads" }]} />
      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Council Resources"
            title="Informations & Downloads"
            description="Notices, circulars, guidelines, forms and other information published by the council. Filter, search or sort to find what you need."
          />
          <div className="mt-12">
            <InformationsBrowser documents={[...STATIC_DOCUMENTS, ...documents]} categories={categories} />
          </div>
        </div>
      </section>
    </>
  );
}
