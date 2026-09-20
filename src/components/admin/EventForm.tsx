"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ImagePlus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type EventData = {
  id?: number;
  title: string;
  slug?: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  venue?: string | null;
  googleMapsUrl?: string | null;
  featuredImage?: string | null;
  contactInfo?: string | null;
  registrationUrl?: string | null;
  status: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
};

function toDateInputValue(v?: string | null) {
  if (!v) return "";
  return String(v).slice(0, 10);
}

export function EventForm({ mode, initial }: { mode: "create" | "edit"; initial?: EventData }) {
  const router = useRouter();
  const { push } = useToast();
  const [values, setValues] = useState<EventData>(
    initial
      ? { ...initial, startDate: toDateInputValue(initial.startDate), endDate: toDateInputValue(initial.endDate) }
      : { title: "", startDate: "", status: "draft" }
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadFeaturedImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "events");
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        push("error", json.message || "Image upload failed.");
        return;
      }
      setValues((v) => ({ ...v, featuredImage: json.path }));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim() || !values.startDate) {
      push("error", "Title and start date are required.");
      return;
    }
    setSaving(true);
    try {
      const url = mode === "create" ? "/api/admin/events" : `/api/admin/events/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        push("error", json.message || "Could not save event.");
        return;
      }
      push("success", mode === "create" ? "Event created." : "Event updated.");
      router.push("/admin/events");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-brand-border bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Title *</label>
            <input
              required
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">URL Slug (auto-generated if left blank)</label>
            <input
              value={values.slug || ""}
              onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Description</label>
            <textarea
              rows={8}
              value={values.description || ""}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">Venue</label>
              <input
                value={values.venue || ""}
                onChange={(e) => setValues((v) => ({ ...v, venue: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">Google Maps URL</label>
              <input
                value={values.googleMapsUrl || ""}
                onChange={(e) => setValues((v) => ({ ...v, googleMapsUrl: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">Contact Info</label>
              <input
                value={values.contactInfo || ""}
                onChange={(e) => setValues((v) => ({ ...v, contactInfo: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">External Registration URL</label>
              <input
                value={values.registrationUrl || ""}
                onChange={(e) => setValues((v) => ({ ...v, registrationUrl: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-white p-6 space-y-4">
          <h3 className="font-semibold text-brand-ink">SEO</h3>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">SEO Title</label>
            <input
              value={values.seoTitle || ""}
              onChange={(e) => setValues((v) => ({ ...v, seoTitle: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Meta Description</label>
            <textarea
              rows={2}
              value={values.metaDescription || ""}
              onChange={(e) => setValues((v) => ({ ...v, metaDescription: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-brand-border bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Status</label>
            <select
              value={values.status}
              onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">Start Date *</label>
              <input
                type="date"
                required
                value={values.startDate}
                onChange={(e) => setValues((v) => ({ ...v, startDate: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-3 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">End Date</label>
              <input
                type="date"
                value={values.endDate || ""}
                onChange={(e) => setValues((v) => ({ ...v, endDate: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-3 py-2.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">Start Time</label>
              <input
                type="time"
                value={values.startTime || ""}
                onChange={(e) => setValues((v) => ({ ...v, startTime: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-3 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">End Time</label>
              <input
                type="time"
                value={values.endTime || ""}
                onChange={(e) => setValues((v) => ({ ...v, endTime: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-3 py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Featured Image</label>
            {values.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={values.featuredImage} alt="" className="w-full h-32 rounded-lg object-cover mb-2" />
            ) : null}
            <label className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary cursor-pointer">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {values.featuredImage ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFeaturedImage(file);
                }}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-brand-primary py-3 rounded-full hover:bg-brand-primary-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {mode === "create" ? "Create Event" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
