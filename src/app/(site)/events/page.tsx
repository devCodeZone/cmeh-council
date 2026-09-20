import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventCard } from "@/components/cards/EventCard";
import { buildMetadata } from "@/lib/seo";
import { getUpcomingEvents, getPastEvents } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/events",
    title: "Events",
    description: "Seminars, workshops, meetings and awareness programmes organised by Electrohomeopath Council Patna.",
  });
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(50), getPastEvents(50)]);

  return (
    <>
      <Breadcrumbs items={[{ label: "Events" }]} />
      <section className="py-16">
        <div className="container-page">
          <SectionHeading as="h1" eyebrow="What's Happening" title="Events" description="Seminars, workshops, meetings, conferences, training and awareness programmes." />

          <div className="mt-14">
            <h2 className="text-xl font-bold text-brand-ink mb-6">Upcoming Events</h2>
            {upcoming.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={{ ...event, isPast: false }} />
                ))}
              </div>
            ) : (
              <p className="text-brand-muted">No upcoming events scheduled at the moment. Please check back soon.</p>
            )}
          </div>

          <div className="mt-16">
            <h2 className="text-xl font-bold text-brand-ink mb-6">Past Events</h2>
            {past.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((event) => (
                  <EventCard key={event.id} event={{ ...event, isPast: true }} />
                ))}
              </div>
            ) : (
              <p className="text-brand-muted">No past events recorded yet.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
