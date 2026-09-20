"use client";

import { SimpleAdminManager } from "@/components/admin/SimpleAdminManager";

export default function AdminServicesPage() {
  return (
    <SimpleAdminManager
      title="Services"
      apiBase="/api/admin/services"
      defaultValues={{ icon: "stethoscope", isPublished: true, sortOrder: 0 }}
      fields={[
        { key: "title", label: "Title", type: "text", required: true },
        { key: "slug", label: "URL Slug (auto-generated if left blank)", type: "text" },
        { key: "icon", label: "Icon key (e.g. stethoscope, book, award)", type: "text" },
        { key: "shortDescription", label: "Short Description", type: "textarea" },
        { key: "fullDescription", label: "Full Description", type: "textarea" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
        { key: "isPublished", label: "Published", type: "checkbox" },
      ]}
      columns={[
        {
          key: "title",
          label: "Title",
          render: (r) => (
            <div>
              <p className="font-semibold text-brand-ink">{r.title}</p>
              <p className="text-xs text-brand-muted">/{r.slug}</p>
            </div>
          ),
        },
        { key: "shortDescription", label: "Summary", render: (r) => <span className="line-clamp-2 max-w-xs block">{r.shortDescription}</span> },
        { key: "sortOrder", label: "Order" },
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
