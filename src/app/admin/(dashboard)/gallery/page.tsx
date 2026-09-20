"use client";

import { SimpleAdminManager } from "@/components/admin/SimpleAdminManager";

export default function AdminGalleryPage() {
  return (
    <SimpleAdminManager
      title="Gallery"
      apiBase="/api/admin/gallery"
      defaultValues={{ type: "photo", category: "general", isPublished: true, sortOrder: 0 }}
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "type", label: "Type", type: "select", options: ["photo", "video"], required: true },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: ["general", "events", "seminars", "workshops"],
        },
        { key: "imagePath", label: "Photo (for photo type)", type: "image", imageBucket: "gallery" },
        { key: "videoUrl", label: "Video Embed URL (for video type, e.g. YouTube embed link)", type: "text" },
        { key: "thumbnail", label: "Thumbnail (for video type)", type: "image", imageBucket: "gallery" },
        { key: "sortOrder", label: "Sort Order", type: "number" },
        { key: "isPublished", label: "Published", type: "checkbox" },
      ]}
      columns={[
        {
          key: "preview",
          label: "Preview",
          render: (r) => {
            const src = r.type === "video" ? r.thumbnail : r.imagePath;
            return src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="h-12 w-16 rounded-lg object-cover" />
            ) : (
              <div className="h-12 w-16 rounded-lg bg-brand-surface-alt" />
            );
          },
        },
        { key: "title", label: "Title", render: (r) => r.title || "—" },
        { key: "type", label: "Type" },
        { key: "category", label: "Category" },
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
