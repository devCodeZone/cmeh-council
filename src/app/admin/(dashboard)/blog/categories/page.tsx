"use client";

import { SimpleAdminManager } from "@/components/admin/SimpleAdminManager";

export default function AdminBlogCategoriesPage() {
  return (
    <SimpleAdminManager
      title="Blog Categories"
      apiBase="/api/admin/blog-categories"
      fields={[
        { key: "name", label: "Category Name", type: "text", required: true },
        { key: "slug", label: "URL Slug (auto-generated if left blank)", type: "text" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
      ]}
    />
  );
}
