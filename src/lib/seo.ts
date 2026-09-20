import type { Metadata } from "next";
import { db } from "@/lib/db";
import { seoMeta } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSettings } from "@/lib/settings";

/**
 * Builds per-page metadata, applying any Admin → SEO override stored for
 * `pagePath` on top of the given defaults. Every public page should call
 * this from its `generateMetadata` export.
 */
export async function buildMetadata(params: {
  pagePath: string;
  title: string;
  description: string;
  ogImage?: string;
}): Promise<Metadata> {
  const settings = await getSettings();
  let override: typeof seoMeta.$inferSelect | undefined;
  try {
    const rows = await db.select().from(seoMeta).where(eq(seoMeta.pagePath, params.pagePath)).limit(1);
    override = rows[0];
  } catch {
    override = undefined;
  }

  const title = override?.title || params.title;
  const description = override?.metaDescription || params.description;
  const canonical = override?.canonicalUrl || `${settings.url}${params.pagePath === "/" ? "" : params.pagePath}`;
  const ogImage = override?.ogImage || params.ogImage || `${settings.url}/opengraph-image`;
  const robots = override?.robots || "index,follow";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: settings.orgName,
      images: [{ url: ogImage }],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: robots.includes("index") && !robots.includes("noindex"),
      follow: robots.includes("follow") && !robots.includes("nofollow"),
    },
  };
}

export function organizationJsonLd(settings: Awaited<ReturnType<typeof getSettings>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.orgName,
    alternateName: settings.shortName,
    url: settings.url,
    logo: `${settings.url}/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${settings.address.line1}, ${settings.address.line2}`,
      addressLocality: settings.address.city,
      addressRegion: settings.address.state,
      postalCode: settings.address.pincode,
      addressCountry: "IN",
    },
    telephone: settings.phone,
    email: settings.email,
    sameAs: Object.values(settings.social).filter(Boolean),
  };
}

export function websiteJsonLd(settings: Awaited<ReturnType<typeof getSettings>>) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.orgName,
    url: settings.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${settings.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
