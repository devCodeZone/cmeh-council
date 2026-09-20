import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function LegalPageShell({
  title,
  effectiveDate,
  intro,
  children,
}: {
  title: string;
  effectiveDate: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs items={[{ label: title }]} />
      <section className="py-16">
        <div className="container-page max-w-3xl">
          <SectionHeading align="left" eyebrow="Legal" title={title} as="h1" />
          <p className="mt-4 text-sm text-brand-muted">Effective date: {effectiveDate}</p>
          {intro ? <p className="mt-6 text-brand-body leading-relaxed">{intro}</p> : null}
          <div className="mt-10 space-y-8 legal-prose">{children}</div>
        </div>
      </section>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-brand-ink mb-3">{title}</h2>
      <div className="space-y-3 text-sm sm:text-[15px] text-brand-body leading-relaxed">{children}</div>
    </div>
  );
}
