import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryGrid } from "@/components/GalleryGrid";
import { buildMetadata } from "@/lib/seo";
import { getGalleryItems } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/gallery",
    title: "Gallery",
    description: "Photographs and videos from Electrohomeopath Council Patna's events, seminars and workshops.",
  });
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <>
      <Breadcrumbs items={[{ label: "Gallery" }]} />
      <section className="py-16">
        <div className="container-page">
          <SectionHeading as="h1" eyebrow="Moments" title="Gallery" description="Photographs and videos from council events, seminars and workshops." />
          <div className="mt-12">
            <GalleryGrid items={items} />
          </div>
        </div>
      </section>
    </>
  );
}
