"use client";

import { SimpleAdminManager } from "@/components/admin/SimpleAdminManager";

export default function AdminFaqPage() {
  return (
    <SimpleAdminManager
      title="FAQ"
      apiBase="/api/admin/faq"
      defaultValues={{ category: "general", isPublished: true, sortOrder: 0 }}
      fields={[
        { key: "question", label: "Question", type: "textarea", required: true },
        { key: "answer", label: "Answer", type: "textarea", required: true },
        {
          key: "category",
          label: "Category",
          type: "select",
          options: ["general", "council", "registration", "documents", "payments", "events"],
        },
        { key: "sortOrder", label: "Sort Order", type: "number" },
        { key: "isPublished", label: "Published", type: "checkbox" },
      ]}
      columns={[
        { key: "question", label: "Question", render: (r) => <span className="line-clamp-2 max-w-sm block">{r.question}</span> },
        { key: "category", label: "Category" },
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
