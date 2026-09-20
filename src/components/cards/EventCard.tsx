import Link from "next/link";
import { CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type EventCardData = {
  slug: string;
  title: string;
  description?: string | null;
  startDate: string | Date;
  startTime?: string | null;
  venue?: string | null;
  featuredImage?: string | null;
  isPast?: boolean;
};

export function EventCard({ event }: { event: EventCardData }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-brand-border bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <Link href={`/events/${event.slug}`} className="block aspect-[16/9] bg-brand-primary-light relative overflow-hidden">
        {event.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.featuredImage} alt="" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="size-full flex items-center justify-center text-brand-primary/40 text-sm font-medium">
            Electrohomeopath Council Patna
          </div>
        )}
        <span
          className={cn(
            "absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full",
            event.isPast ? "bg-slate-700 text-white" : "bg-brand-accent text-white"
          )}
        >
          {event.isPast ? "Past Event" : "Upcoming"}
        </span>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-brand-ink text-lg leading-snug mb-2">
          <Link href={`/events/${event.slug}`} className="hover:text-brand-primary focus-ring rounded">
            {event.title}
          </Link>
        </h3>
        {event.description ? (
          <p
            className="text-sm text-brand-body leading-relaxed mb-3 flex-1"
            dangerouslySetInnerHTML={{ __html: truncate(event.description.replace(/<[^>]+>/g, ""), 110) }}
          />
        ) : null}
        <div className="space-y-1.5 text-xs text-brand-muted mb-4">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" /> {formatDate(event.startDate)}
          </span>
          {event.startTime ? (
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> {event.startTime}
            </span>
          ) : null}
          {event.venue ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {event.venue}
            </span>
          ) : null}
        </div>
        <Link href={`/events/${event.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary mt-auto">
          View Details <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
