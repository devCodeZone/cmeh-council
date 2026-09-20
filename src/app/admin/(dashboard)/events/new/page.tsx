import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary mb-4">
        <ArrowLeft className="size-4" /> Back to Events
      </Link>
      <h1 className="text-2xl font-bold text-brand-ink mb-6">Add New Event</h1>
      <EventForm mode="create" />
    </div>
  );
}
