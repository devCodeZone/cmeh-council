"use client";

import { SimpleAdminManager } from "@/components/admin/SimpleAdminManager";

export default function AdminTestimonialsPage() {
  return (
    <SimpleAdminManager
      title="Testimonials"
      apiBase="/api/admin/testimonials"
      defaultValues={{ rating: 5, isPublished: true, sortOrder: 0 }}
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "designation", label: "Designation", type: "text" },
        { key: "location", label: "Location", type: "text" },
        { key: "quote", label: "Quote", type: "textarea", required: true },
        { key: "rating", label: "Rating (1-5)", type: "number" },
        { key: "photoPath", label: "Photo", type: "image", imageBucket: "testimonials" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
        { key: "isPublished", label: "Published", type: "checkbox" },
      ]}
      columns={[
        {
          key: "name",
          label: "Name",
          render: (r) => (
            <div>
              <p className="font-semibold text-brand-ink">{r.name}</p>
              {r.designation ? <p className="text-xs text-brand-muted">{r.designation}</p> : null}
            </div>
          ),
        },
        { key: "quote", label: "Quote", render: (r) => <span className="line-clamp-2 max-w-xs block">{r.quote}</span> },
        { key: "rating", label: "Rating" },
        {
          key: "isPublished",
          label: "Status",
          render: (r) => (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
              {r.isPublished ? "Published" : "Draft"}
            </span>
          ),
        },
      ]}
    />
  );
}
