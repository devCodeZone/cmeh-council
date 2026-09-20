import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: item.label,
        item: item.href ? `${siteConfig.url}${item.href}` : undefined,
      })),
    ],
  };

  return (
    <nav aria-label="Breadcrumb" className="border-b border-brand-border bg-brand-surface-alt">
      <div className="container-page py-3">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-brand-muted">
          <li className="flex items-center gap-1.5">
            <Link href="/" className="flex items-center gap-1 hover:text-brand-primary focus-ring rounded">
              <Home className="size-3.5" aria-hidden />
              Home
            </Link>
          </li>
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5 text-brand-border" aria-hidden />
              {item.href ? (
                <Link href={item.href} className="hover:text-brand-primary focus-ring rounded">
                  {item.label}
                </Link>
              ) : (
                <span className="text-brand-ink font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
