"use client";

import { SimpleAdminManager } from "@/components/admin/SimpleAdminManager";

export default function AdminTeamPage() {
  return (
    <SimpleAdminManager
      title="Team Members"
      apiBase="/api/admin/team"
      defaultValues={{ isPublished: true, sortOrder: 0 }}
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "position", label: "Position / Designation", type: "text" },
        { key: "photoPath", label: "Photo", type: "image", imageBucket: "team" },
        { key: "bio", label: "Short Bio", type: "textarea" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
        { key: "isPublished", label: "Published", type: "checkbox" },
      ]}
      columns={[
        {
          key: "name",
          label: "Name",
          render: (r) => (
            <div className="flex items-center gap-3">
              {r.photoPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photoPath} alt="" className="size-9 rounded-full object-cover" />
              ) : (
                <div className="size-9 rounded-full bg-brand-surface-alt" />
              )}
              <div>
                <p className="font-semibold text-brand-ink">{r.name}</p>
                {r.position ? <p className="text-xs text-brand-muted">{r.position}</p> : null}
              </div>
            </div>
          ),
        },
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
