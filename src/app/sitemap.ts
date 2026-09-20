import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";
import { getBlogPosts, getUpcomingEvents, getPastEvents, getAllDocuments, getPublishedServices } from "@/lib/queries";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/informations", changeFrequency: "weekly", priority: 0.7 },
  { path: "/registration", changeFrequency: "monthly", priority: 0.9 },
  { path: "/track-application", changeFrequency: "monthly", priority: 0.4 },
  { path: "/gallery", changeFrequency: "monthly", priority: 0.5 },
  { path: "/testimonials", changeFrequency: "monthly", priority: 0.5 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/events", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms-conditions", changeFrequency: "yearly", priority: 0.2 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();
  const baseUrl = settings.url.replace(/\/$/, "");

  const [posts, upcoming, past, documents, services] = await Promise.all([
    getBlogPosts(),
    getUpcomingEvents(50),
    getPastEvents(50),
    getAllDocuments({}),
    getPublishedServices(),
  ]);

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  for (const post of posts) {
    entries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const event of [...upcoming, ...past]) {
    entries.push({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  for (const service of services) {
    entries.push({
      url: `${baseUrl}/services#${service.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Publicly downloadable council documents/notices are informational assets rather
  // than standalone pages, but are included here at low priority for discoverability.
  for (const doc of documents.slice(0, 100)) {
    entries.push({
      url: `${baseUrl}/informations#doc-${doc.id}`,
      lastModified: doc.publicationDate ? new Date(doc.publicationDate) : new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  return entries;
}
