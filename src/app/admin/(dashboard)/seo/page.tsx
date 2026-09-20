"use client";

import { SimpleAdminManager } from "@/components/admin/SimpleAdminManager";

export default function AdminSeoPage() {
  return (
    <div>
      <p className="text-sm text-brand-muted mb-4 max-w-2xl">
        Per-page SEO overrides. Add a row for any page path (e.g. <code>/</code>, <code>/about</code>, <code>/services</code>) to override its default
        title, meta description and other tags. Pages without an entry here use their built-in defaults.
      </p>
      <SimpleAdminManager
        title="SEO Meta Overrides"
        apiBase="/api/admin/seo"
        defaultValues={{ robots: "index,follow" }}
        fields={[
          { key: "pagePath", label: "Page Path (e.g. /about)", type: "text", required: true },
          { key: "title", label: "Meta Title", type: "text" },
          { key: "metaDescription", label: "Meta Description", type: "textarea" },
          { key: "focusKeyword", label: "Focus Keyword", type: "text" },
          { key: "canonicalUrl", label: "Canonical URL", type: "text" },
          { key: "ogImage", label: "Open Graph Image", type: "image", imageBucket: "seo" },
          { key: "robots", label: "Robots Directive", type: "select", options: ["index,follow", "noindex,follow", "index,nofollow", "noindex,nofollow"] },
        ]}
        columns={[
          { key: "pagePath", label: "Page Path" },
          { key: "title", label: "Title", render: (r) => r.title || "—" },
          { key: "robots", label: "Robots" },
        ]}
      />
    </div>
  );
}
