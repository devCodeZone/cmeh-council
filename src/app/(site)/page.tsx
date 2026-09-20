import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Download,
  Bell,
  CalendarDays,
  Phone,
  Image as ImageIcon,
  ArrowRight,
  FileEdit,
  UploadCloud,
  ClipboardCheck,
  CreditCard,
  BadgeCheck,
  Eye,
  Target,
  Compass,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ActionCard } from "@/components/cards/ActionCard";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { STATIC_DOCUMENTS } from "@/lib/static-documents";
import { BlogCard } from "@/components/cards/BlogCard";
import { EventCard } from "@/components/cards/EventCard";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { getSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";
import {
  getPublishedServices,
  getFeaturedDocuments,
  getLatestBlogPosts,
  getUpcomingEvents,
  getPastEvents,
  getGalleryItems,
  getPublishedTestimonials,
  getPublishedFaqs,
} from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/",
    title: "Electrohomeopath Council Patna | Registration, Information & Updates",
    description:
      "Electrohomeopath Council Patna: candidate registration, council notices, downloadable information, events and updates for Electrohomeopathy in Patna, Bihar.",
  });
}

export default async function HomePage() {
  const settings = await getSettings();
  const [servicesList, documents, blogPosts, upcomingEvents, pastEvents, gallery, testimonialItems, faqs] = await Promise.all([
    getPublishedServices(8),
    getFeaturedDocuments(3),
    getLatestBlogPosts(3),
    getUpcomingEvents(2),
    getPastEvents(1),
    getGalleryItems().then((g) => g.slice(0, 8)),
    getPublishedTestimonials(),
    getPublishedFaqs().then((f) => f.slice(0, 6)),
  ]);
  const events = [...upcomingEvents, ...pastEvents].slice(0, 3);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-brand-ink text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(201,154,58,0.25),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(11,93,82,0.6),_transparent_55%)]" />
        <div className="container-page relative py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-brand-accent mb-5 bg-white/5 px-3 py-1.5 rounded-full">
              {settings.shortName} · Patna, Bihar
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-balance">
              {settings.orgName}
            </h1>
            <p className="mt-5 text-lg text-white/80 leading-relaxed max-w-xl">{settings.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/registration" variant="accent" size="lg">
                Register Online
              </LinkButton>
              <LinkButton href="/about" variant="outline" size="lg">
                Learn More
              </LinkButton>
              <LinkButton href="/contact" variant="ghost" size="lg" className="text-white hover:bg-white/10">
                Contact Council
              </LinkButton>
            </div>
          </div>
          <div className="reveal">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 grid grid-cols-2 gap-5">
              <HeroStat icon={ClipboardList} label="Candidate Registration" value="Online" />
              <HeroStat icon={Download} label="Council Documents" value="Downloadable" />
              <HeroStat icon={CalendarDays} label="Events & Seminars" value="Regular" />
              <HeroStat icon={Phone} label="Council Support" value="Reachable" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Introduction ---------------- */}
      <section className="py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="About the Council"
            title={`Welcome to ${settings.orgName}`}
            description="A council dedicated to education, awareness and professional development activities relating to Electrohomeopathy in Patna and across Bihar."
          />
          <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
            <IntroPoint title="Who We Are" text="An organised council supporting candidates and practitioners engaged with Electrohomeopathy." />
            <IntroPoint title="What We Do" text="Candidate registration, educational activities, awareness programmes, and publication of council information." />
            <IntroPoint title="Who We Serve" text="Students, candidates and practitioners across Patna, Bihar, seeking structured registration and information." />
          </div>
          <div className="mt-10 text-center">
            <LinkButton href="/about" variant="secondary">
              Know More About Us <ArrowRight className="size-4" />
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ---------------- Quick Action Cards ---------------- */}
      <section className="py-20 bg-brand-surface-alt">
        <div className="container-page">
          <SectionHeading eyebrow="Get Started" title="What Would You Like To Do?" />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard icon={ClipboardList} title="Online Registration" description="Complete your candidate application entirely online, in a few guided steps." href="/registration" cta="Start Registration" />
            <ActionCard icon={Download} title="Download Informations" description="Access notices, circulars, guidelines and forms published by the council." href="/informations" cta="View Downloads" />
            <ActionCard icon={Bell} title="Latest Notices" description="Stay updated with the council's latest notices and announcements." href="/informations" cta="See Notices" />
            <ActionCard icon={CalendarDays} title="Upcoming Events" description="Explore seminars, workshops and awareness programmes near you." href="/events" cta="View Events" />
            <ActionCard icon={Phone} title="Contact Council" description="Reach out with questions about registration, documents or events." href="/contact" cta="Get in Touch" />
            <ActionCard icon={ImageIcon} title="Gallery" description="Browse photographs and videos from council events and activities." href="/gallery" cta="View Gallery" />
          </div>
        </div>
      </section>

      {/* ---------------- Mission / Vision / Values ---------------- */}
      <section className="py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Our Foundation" title="Mission, Vision & Values" description="The principles that guide the council's work in Patna and Bihar." />
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            <ValueCard icon={Target} title="Mission" text="To support structured registration and continuing education for those engaged with Electrohomeopathy." />
            <ValueCard icon={Eye} title="Vision" text="A well-organised, transparent council that candidates and the public can rely on for accurate information." />
            <ValueCard icon={Compass} title="Values" text="Transparency, accessibility, education and integrity in every council activity." />
          </div>
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      {servicesList.length ? (
        <section className="py-20 bg-brand-surface-alt">
          <div className="container-page">
            <SectionHeading eyebrow="What We Offer" title="Our Services & Activities" description="Council activities are limited to education, registration and awareness — no medical claims are made." />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {servicesList.map((s) => (
                <ServiceCard key={s.id} title={s.title} slug={s.slug} icon={s.icon} shortDescription={s.shortDescription} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <LinkButton href="/services" variant="secondary">
                View All Services <ArrowRight className="size-4" />
              </LinkButton>
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------- Informations & Downloads ---------------- */}
      <section className="py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Stay Informed" title="Informations & Downloads" description="The latest notices, circulars, guidelines and forms published by the council." />
          {(() => {
            const homeDocuments = [...STATIC_DOCUMENTS, ...documents];
            return homeDocuments.length ? (
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeDocuments.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            ) : (
              <p className="mt-12 text-center text-brand-muted">Documents will appear here once published by the council.</p>
            );
          })()}
          <div className="mt-10 text-center">
            <LinkButton href="/informations" variant="secondary">
              View All Informations <ArrowRight className="size-4" />
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ---------------- Registration CTA + Process ---------------- */}
      <section className="py-20 bg-brand-primary text-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Join The Council"
            title={`Register With ${settings.orgName}`}
            description="Complete a guided online application, upload your documents, and pay the registration fee securely — all from this website."
            className="[&_h2]:text-white [&_p]:text-white/80"
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ProcessStep icon={FileEdit} step={1} label="Fill Application" />
            <ProcessStep icon={UploadCloud} step={2} label="Upload Documents" />
            <ProcessStep icon={ClipboardCheck} step={3} label="Review Details" />
            <ProcessStep icon={CreditCard} step={4} label="Pay Registration Fee" />
            <ProcessStep icon={BadgeCheck} step={5} label="Receive Acknowledgement" />
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <LinkButton href="/registration" variant="accent" size="lg">
              Start Online Registration
            </LinkButton>
            <LinkButton href="/informations" variant="outline" size="lg">
              Registration Guidelines
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ---------------- Latest News / Blog ---------------- */}
      {blogPosts.length ? (
        <section className="py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Latest Updates" title="News & Announcements" />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <LinkButton href="/blog" variant="secondary">
                View All News <ArrowRight className="size-4" />
              </LinkButton>
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------- Events ---------------- */}
      {events.length ? (
        <section className="py-20 bg-brand-surface-alt">
          <div className="container-page">
            <SectionHeading eyebrow="What's Happening" title="Events" />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={{ ...event, isPast: new Date(event.startDate) < new Date() }} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <LinkButton href="/events" variant="secondary">
                View All Events <ArrowRight className="size-4" />
              </LinkButton>
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------- Gallery Preview ---------------- */}
      {gallery.length ? (
        <section className="py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Moments" title="Gallery" />
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gallery.map((item) => (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-brand-primary-light">
                  {item.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imagePath} alt={item.title || ""} className="size-full object-cover hover:scale-105 transition-transform duration-500" />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <LinkButton href="/gallery" variant="secondary">
                View Complete Gallery <ArrowRight className="size-4" />
              </LinkButton>
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------- Testimonials ---------------- */}
      {testimonialItems.length ? (
        <section className="py-20 bg-brand-surface-alt">
          <div className="container-page">
            <SectionHeading eyebrow="What People Say" title="Testimonials" />
            <div className="mt-12">
              <TestimonialSlider items={testimonialItems} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------- FAQ Preview ---------------- */}
      {faqs.length ? (
        <section className="py-20">
          <div className="container-page max-w-3xl">
            <SectionHeading eyebrow="Questions" title="Frequently Asked Questions" />
            <div className="mt-12">
              <FaqAccordion items={faqs} />
            </div>
            <div className="mt-8 text-center">
              <LinkButton href="/faq" variant="secondary">
                View All FAQs <ArrowRight className="size-4" />
              </LinkButton>
            </div>
          </div>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            }}
          />
        </section>
      ) : null}

      {/* ---------------- Contact CTA ---------------- */}
      <section className="py-20 bg-brand-ink text-white">
        <div className="container-page text-center">
          <SectionHeading
            title="Need More Information?"
            description="Our team is available to help with registration, documents, and general enquiries."
            className="[&_h2]:text-white [&_p]:text-white/80"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Council
            </LinkButton>
            <LinkButton href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} variant="outline" size="lg">
              Call Now
            </LinkButton>
            <LinkButton
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
              variant="outline"
              size="lg"
            >
              WhatsApp Us
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <Icon className="size-6 text-brand-accent mb-3" />
      <p className="text-sm text-white/70">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function IntroPoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-brand-border p-6 bg-white">
      <h3 className="font-semibold text-brand-ink mb-2">{title}</h3>
      <p className="text-sm text-brand-body leading-relaxed">{text}</p>
    </div>
  );
}

function ValueCard({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
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

function ProcessStep({ icon: Icon, step, label }: { icon: React.ComponentType<{ className?: string }>; step: number; label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="relative flex size-16 items-center justify-center rounded-full bg-white/10 border border-white/20">
        <Icon className="size-7" />
        <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-brand-accent text-xs font-bold">
          {step}
        </span>
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
