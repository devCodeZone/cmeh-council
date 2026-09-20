import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/DynamicIcon";
import { buildMetadata } from "@/lib/seo";
import { getPublishedServices } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/services",
    title: "Services & Activities",
    description: "Explore the education, registration, and awareness activities offered by Electrohomeopath Council Patna.",
  });
}

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <>
      <Breadcrumbs items={[{ label: "Services" }]} />
      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            as="h1"
            eyebrow="What We Offer"
            title="Our Services & Activities"
            description="The council's activities are educational, administrative and awareness-focused. No medical treatment claims are made on this website."
          />
          <div className="mt-14 space-y-6">
            {services.map((service, idx) => (
              <div
                key={service.id}
                id={service.slug}
                className="scroll-mt-24 grid sm:grid-cols-[auto_1fr] gap-6 items-start rounded-2xl border border-brand-border bg-white p-7 sm:p-8"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-primary text-white">
                  <DynamicIcon name={service.icon} className="size-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-brand-ink mb-2">
                    {idx + 1}. {service.title}
                  </h2>
                  <p className="text-brand-body leading-relaxed mb-1">{service.shortDescription}</p>
                  <p className="text-brand-body leading-relaxed">{service.fullDescription}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-14 rounded-2xl bg-brand-primary text-white p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Register?</h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Begin your online candidate registration with Electrohomeopath Council Patna today.
            </p>
            <LinkButton href="/registration" variant="accent" size="lg">
              Start Online Registration
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
