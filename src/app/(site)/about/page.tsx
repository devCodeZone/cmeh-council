import type { Metadata } from "next";
import { Target, Eye, Compass, ListChecks, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InformationsBrowser } from "@/components/InformationsBrowser";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { getAllDocuments, getDocumentCategories, getPublishedTeam } from "@/lib/queries";
import { STATIC_DOCUMENTS } from "@/lib/static-documents";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/about",
    title: "About",
    description: "Learn about Electrohomeopath Council Patna — our story, vision, mission, objectives, core values and leadership team.",
  });
}

export default async function AboutPage() {
  const settings = await getSettings();
  const [documents, categories, team] = await Promise.all([getAllDocuments({}), getDocumentCategories(), getPublishedTeam()]);

  return (
    <>
      <Breadcrumbs items={[{ label: "About" }]} />

      <section className="py-16">
        <div className="container-page max-w-4xl">
          <SectionHeading align="left" eyebrow="About the Council" title={`About ${settings.orgName}`} as="h1" />
          <div className="mt-8 space-y-5 text-brand-body leading-relaxed">
            <p>
              {settings.orgName} works to support education, awareness and structured registration for candidates and
              practitioners engaged with Electrohomeopathy in Patna and across Bihar. This page will be updated with
              the council&rsquo;s verified organisational history, structure and activities.
            </p>
            <p className="rounded-xl border border-brand-accent/30 bg-brand-accent-light p-4 text-sm text-brand-ink">
              <strong>Note on recognition &amp; affiliation:</strong> {settings.recognitionStatement}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-surface-alt">
        <div className="container-page max-w-4xl">
          <SectionHeading align="left" eyebrow="Our Story" title="Our Story" />
          <ol className="mt-10 relative border-s-2 border-brand-border ps-6 space-y-8">
            <TimelineItem
              year={settings.foundingYear ? String(settings.foundingYear) : "[Year to be confirmed]"}
              title="Council Established"
              text="Placeholder milestone. Replace with the verified founding date and background of the council."
            />
            <TimelineItem year="Ongoing" title="Educational & Awareness Activities" text="Placeholder milestone describing the council's educational and awareness initiatives." />
            <TimelineItem year="Ongoing" title="Online Registration Portal" text="Launch of this website enabling candidates to register, track applications and access council information online." />
          </ol>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Our Foundation" title="Vision, Mission & Objectives" />
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            <Card icon={Eye} title="Vision" text="A well-organised, transparent council that candidates and the public can rely on for accurate information." />
            <Card icon={Target} title="Mission" text="To support structured registration and continuing education for those engaged with Electrohomeopathy." />
            <Card icon={ListChecks} title="Objectives" text="Facilitate registration, publish verified information, and organise educational and awareness activities." />
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-surface-alt">
        <div className="container-page">
          <SectionHeading eyebrow="What Drives Us" title="Core Values" />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {["Transparency", "Accessibility", "Education", "Integrity"].map((v) => (
              <div key={v} className="rounded-2xl border border-brand-border bg-white p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-primary-light text-brand-primary mb-4">
                  <Compass className="size-6" />
                </div>
                <h3 className="font-semibold text-brand-ink">{v}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {team.length ? (
        <section className="py-16">
          <div className="container-page">
            <SectionHeading eyebrow="Leadership" title="Council / Leadership Team" />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.id} className="rounded-2xl border border-brand-border bg-white p-6 text-center">
                  <div className="mx-auto size-20 rounded-full bg-brand-primary-light overflow-hidden mb-4">
                    {member.photoPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photoPath} alt={member.name} className="size-full object-cover" />
                    ) : null}
                  </div>
                  <h3 className="font-semibold text-brand-ink">{member.name}</h3>
                  <p className="text-sm text-brand-accent font-medium mb-2">{member.position}</p>
                  <p className="text-sm text-brand-body leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="informations" className="py-16 bg-brand-surface-alt scroll-mt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Council Resources"
            title="Informations"
            description="Notices, circulars, guidelines, forms and other information uploaded by the council appear here automatically."
          />
          <div className="mt-12">
            <InformationsBrowser documents={[...STATIC_DOCUMENTS, ...documents]} categories={categories} />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-page max-w-3xl text-center text-sm text-brand-muted flex items-center justify-center gap-2">
          <ShieldCheck className="size-4 shrink-0" />
          <span>
            This website makes no claims of government recognition, statutory status, or official medical council
            approval unless explicitly confirmed with verified documentation by an authorised administrator.
          </span>
        </div>
      </section>
    </>
  );
}

function TimelineItem({ year, title, text }: { year: string; title: string; text: string }) {
  return (
    <li className="relative">
      <span className="absolute -start-[31px] flex size-4 items-center justify-center rounded-full bg-brand-primary ring-4 ring-white" />
      <span className="text-xs font-bold uppercase tracking-wide text-brand-accent">{year}</span>
      <h3 className="font-semibold text-brand-ink mt-1">{title}</h3>
      <p className="text-sm text-brand-body leading-relaxed mt-1">{text}</p>
    </li>
  );
}

function Card({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-7 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-primary-light text-brand-primary mb-5">
        <Icon className="size-7" />
      </div>
      <h3 className="font-semibold text-brand-ink text-lg mb-2">{title}</h3>
      <p className="text-sm text-brand-body leading-relaxed">{text}</p>
    </div>
  );
}
