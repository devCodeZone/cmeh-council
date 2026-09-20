import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EventForm } from "@/components/admin/EventForm";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(events).where(eq(events.id, Number(id)));
  if (!row) notFound();

  return (
    <div>
      <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary mb-4">
        <ArrowLeft className="size-4" /> Back to Events
      </Link>
      <h1 className="text-2xl font-bold text-brand-ink mb-6">Edit Event</h1>
      <EventForm mode="edit" initial={row} />
    </div>
  );
}
