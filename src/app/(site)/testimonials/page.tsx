import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildMetadata } from "@/lib/seo";
import { getPublishedTestimonials } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/testimonials",
    title: "Testimonials",
    description: "What candidates and practitioners say about Electrohomeopath Council Patna.",
  });
}

export default async function TestimonialsPage() {
  const items = await getPublishedTestimonials();

  return (
    <>
      <Breadcrumbs items={[{ label: "Testimonials" }]} />
      <section className="py-16">
        <div className="container-page">
          <SectionHeading as="h1" eyebrow="What People Say" title="Testimonials" />
          {items.length ? (
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((t) => (
                <div key={t.id} className="rounded-2xl border border-brand-border bg-white p-6 flex flex-col">
                  {t.rating ? (
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-4 ${i < (t.rating || 0) ? "fill-brand-accent text-brand-accent" : "text-brand-border"}`} />
                      ))}
                    </div>
                  ) : null}
                  <p className="text-brand-body leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-brand-primary-light overflow-hidden shrink-0">
                      {t.photoPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.photoPath} alt={t.name} className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-ink text-sm">{t.name}</p>
                      <p className="text-xs text-brand-muted">{[t.designation, t.location].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-14 text-center text-brand-muted">Testimonials will appear here once published.</p>
          )}
        </div>
      </section>
    </>
  );
}
