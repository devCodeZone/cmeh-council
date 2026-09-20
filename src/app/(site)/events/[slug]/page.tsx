import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { getEventBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return buildMetadata({ pagePath: `/events/${slug}`, title: "Event Not Found", description: "This event could not be found." });
  return buildMetadata({
    pagePath: `/events/${slug}`,
    title: event.seoTitle || event.title,
    description: event.metaDescription || event.description?.replace(/<[^>]+>/g, "").slice(0, 160) || "",
    ogImage: event.featuredImage || undefined,
  });
}

export default async function EventDetailPage({ params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const settings = await getSettings();
  const isPast = new Date(event.startDate) < new Date();

  return (
    <>
      <Breadcrumbs items={[{ label: "Events", href: "/events" }, { label: event.title }]} />
      <article className="py-16">
        <div className="container-page max-w-3xl">
          <span className={`inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4 ${isPast ? "bg-slate-100 text-slate-700" : "bg-brand-accent-light text-brand-accent"}`}>
            {isPast ? "Past Event" : "Upcoming Event"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-ink mb-6">{event.title}</h1>

          {event.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.featuredImage} alt="" className="w-full rounded-2xl mb-8 aspect-video object-cover" />
          ) : null}

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <InfoTile icon={CalendarDays} label="Date" value={`${formatDate(event.startDate)}${event.endDate ? ` – ${formatDate(event.endDate)}` : ""}`} />
            {event.startTime ? <InfoTile icon={Clock} label="Time" value={`${event.startTime}${event.endTime ? ` – ${event.endTime}` : ""}`} /> : null}
            {event.venue ? <InfoTile icon={MapPin} label="Venue" value={event.venue} /> : null}
          </div>

          {event.description ? (
            <div className="prose-content text-brand-body leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description }} />
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {event.registrationUrl ? (
              <LinkButton href={event.registrationUrl} variant="primary">
                Register for this Event <ExternalLink className="size-4" />
              </LinkButton>
            ) : null}
            {event.googleMapsUrl ? (
              <LinkButton href={event.googleMapsUrl} variant="secondary">
                <MapPin className="size-4" /> View on Map
              </LinkButton>
            ) : null}
          </div>

          {event.contactInfo ? <p className="mt-6 text-sm text-brand-muted">Contact: {event.contactInfo}</p> : null}
        </div>
      </article>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          startDate: event.startDate,
          endDate: event.endDate || event.startDate,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: event.venue
            ? { "@type": "Place", name: event.venue, address: `${settings.address.city}, ${settings.address.state}` }
            : undefined,
          image: event.featuredImage || undefined,
          description: event.description?.replace(/<[^>]+>/g, "").slice(0, 300),
          organizer: { "@type": "Organization", name: settings.orgName, url: settings.url },
        }}
      />
    </>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-4 flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary-light text-brand-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">{label}</p>
        <p className="text-sm text-brand-ink">{value}</p>
      </div>
    </div>
  );
}
