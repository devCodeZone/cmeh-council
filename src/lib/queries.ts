import { db } from "@/lib/db";
import {
  services,
  councilDocuments,
  categories,
  blogPosts,
  blogCategories,
  events,
  galleryItems,
  testimonials,
  teamMembers,
  faqItems,
  applications,
  candidates,
  payments,
} from "@/lib/db/schema";
import { and, desc, eq, gte, lt, or, ilike } from "drizzle-orm";

/**
 * Runs a query and returns `fallback` instead of throwing if it fails —
 * e.g. the database is unreachable. Without this, a single failed query
 * (say, on the homepage's Promise.all of six sections) would crash the
 * whole page instead of just rendering that section empty. Every public
 * data-fetching function below goes through this so the site degrades
 * gracefully instead of erroring out when the database isn't configured
 * yet or is briefly unavailable.
 */
async function safeQuery<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[queries] ${label} failed, returning fallback:`, (err as Error).message);
    return fallback;
  }
}

export async function getApplicationByNumber(applicationNumber: string) {
  return safeQuery(
    "getApplicationByNumber",
    async () => {
      const rows = await db
        .select({ application: applications, candidate: candidates })
        .from(applications)
        .innerJoin(candidates, eq(applications.candidateId, candidates.id))
        .where(eq(applications.applicationNumber, applicationNumber))
        .limit(1);
      if (!rows[0]) return null;

      const paymentRows = await db
        .select()
        .from(payments)
        .where(eq(payments.applicationId, rows[0].application.id))
        .orderBy(desc(payments.createdAt))
        .limit(1);

      return { ...rows[0], payment: paymentRows[0] ?? null };
    },
    null
  );
}

/** Basic identity check so an application number alone can't be used to pull someone else's data. */
export function contactMatchesApplication(
  candidate: { mobile: string; email: string },
  contact: string
) {
  const c = contact.trim().toLowerCase();
  return candidate.mobile === contact.trim() || candidate.email.toLowerCase() === c;
}

export async function getPublishedServices(limit?: number) {
  return safeQuery(
    "getPublishedServices",
    async () => {
      const q = db.select().from(services).where(eq(services.isPublished, true)).orderBy(services.sortOrder);
      return limit ? q.limit(limit) : q;
    },
    []
  );
}

export async function getServiceBySlug(slug: string) {
  return safeQuery(
    "getServiceBySlug",
    async () => {
      const rows = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
      return rows[0] ?? null;
    },
    null
  );
}

export async function getFeaturedDocuments(limit = 6) {
  return safeQuery(
    "getFeaturedDocuments",
    () =>
      db
        .select({
          id: councilDocuments.id,
          title: councilDocuments.title,
          slug: councilDocuments.slug,
          description: councilDocuments.description,
          filePath: councilDocuments.filePath,
          fileType: councilDocuments.fileType,
          fileSize: councilDocuments.fileSize,
          publicationDate: councilDocuments.publicationDate,
          categoryName: categories.name,
        })
        .from(councilDocuments)
        .leftJoin(categories, eq(councilDocuments.categoryId, categories.id))
        .where(eq(councilDocuments.isPublished, true))
        .orderBy(desc(councilDocuments.isFeatured), desc(councilDocuments.publicationDate))
        .limit(limit),
    []
  );
}

export async function getAllDocuments(params: { category?: string; search?: string; sort?: "latest" | "oldest" | "alpha" }) {
  return safeQuery(
    "getAllDocuments",
    () => {
      const conditions = [eq(councilDocuments.isPublished, true)];
      if (params.category && params.category !== "all") {
        conditions.push(eq(categories.slug, params.category));
      }
      if (params.search) {
        conditions.push(ilike(councilDocuments.title, `%${params.search}%`));
      }

      const orderBy =
        params.sort === "oldest"
          ? councilDocuments.publicationDate
          : params.sort === "alpha"
          ? councilDocuments.title
          : desc(councilDocuments.publicationDate);

      return db
        .select({
          id: councilDocuments.id,
          title: councilDocuments.title,
          slug: councilDocuments.slug,
          description: councilDocuments.description,
          filePath: councilDocuments.filePath,
          fileType: councilDocuments.fileType,
          fileSize: councilDocuments.fileSize,
          publicationDate: councilDocuments.publicationDate,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(councilDocuments)
        .leftJoin(categories, eq(councilDocuments.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(orderBy);
    },
    []
  );
}

export async function getDocumentCategories() {
  return safeQuery("getDocumentCategories", () => db.select().from(categories).orderBy(categories.name), []);
}

export async function getBlogCategories() {
  return safeQuery("getBlogCategories", () => db.select().from(blogCategories).orderBy(blogCategories.name), []);
}

export async function getBlogPosts(categorySlug?: string) {
  return safeQuery(
    "getBlogPosts",
    () => {
      const conditions = [eq(blogPosts.status, "published")];
      if (categorySlug && categorySlug !== "all") {
        conditions.push(eq(blogCategories.slug, categorySlug));
      }
      return db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          shortDescription: blogPosts.shortDescription,
          featuredImage: blogPosts.featuredImage,
          publishedAt: blogPosts.publishedAt,
          categoryName: blogCategories.name,
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt));
    },
    []
  );
}

export async function getLatestBlogPosts(limit = 3) {
  return safeQuery(
    "getLatestBlogPosts",
    () =>
      db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          shortDescription: blogPosts.shortDescription,
          featuredImage: blogPosts.featuredImage,
          publishedAt: blogPosts.publishedAt,
          categoryName: blogCategories.name,
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit),
    []
  );
}

export async function getBlogPostBySlug(slug: string) {
  return safeQuery(
    "getBlogPostBySlug",
    async () => {
      const rows = await db
        .select({
          post: blogPosts,
          categoryName: blogCategories.name,
        })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
        .limit(1);
      return rows[0] ?? null;
    },
    null
  );
}

export async function getRelatedBlogPosts(categoryId: number | null, excludeId: number, limit = 3) {
  if (!categoryId) return [];
  return safeQuery(
    "getRelatedBlogPosts",
    () =>
      db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.categoryId, categoryId), eq(blogPosts.status, "published")))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit + 1)
        .then((rows) => rows.filter((r) => r.id !== excludeId).slice(0, limit)),
    []
  );
}

export async function getUpcomingEvents(limit = 3) {
  return safeQuery(
    "getUpcomingEvents",
    () => {
      const today = new Date().toISOString().slice(0, 10);
      return db
        .select()
        .from(events)
        .where(and(eq(events.status, "published"), gte(events.startDate, today)))
        .orderBy(events.startDate)
        .limit(limit);
    },
    []
  );
}

export async function getPastEvents(limit = 20) {
  return safeQuery(
    "getPastEvents",
    () => {
      const today = new Date().toISOString().slice(0, 10);
      return db
        .select()
        .from(events)
        .where(and(eq(events.status, "published"), lt(events.startDate, today)))
        .orderBy(desc(events.startDate))
        .limit(limit);
    },
    []
  );
}

export async function getEventBySlug(slug: string) {
  return safeQuery(
    "getEventBySlug",
    async () => {
      const rows = await db.select().from(events).where(and(eq(events.slug, slug), eq(events.status, "published"))).limit(1);
      return rows[0] ?? null;
    },
    null
  );
}

export async function getGalleryItems(category?: string) {
  return safeQuery(
    "getGalleryItems",
    () => {
      const conditions = [eq(galleryItems.isPublished, true)];
      if (category && category !== "all") {
        if (category === "videos") conditions.push(eq(galleryItems.type, "video"));
        else if (category === "photos") conditions.push(eq(galleryItems.type, "photo"));
        else conditions.push(eq(galleryItems.category, category));
      }
      return db.select().from(galleryItems).where(and(...conditions)).orderBy(galleryItems.sortOrder);
    },
    []
  );
}

export async function getPublishedTestimonials() {
  return safeQuery(
    "getPublishedTestimonials",
    () => db.select().from(testimonials).where(eq(testimonials.isPublished, true)).orderBy(testimonials.sortOrder),
    []
  );
}

export async function getPublishedTeam() {
  return safeQuery(
    "getPublishedTeam",
    () => db.select().from(teamMembers).where(eq(teamMembers.isPublished, true)).orderBy(teamMembers.sortOrder),
    []
  );
}

export async function getPublishedFaqs(category?: string) {
  return safeQuery(
    "getPublishedFaqs",
    () => {
      const conditions = [eq(faqItems.isPublished, true)];
      if (category && category !== "all") conditions.push(eq(faqItems.category, category));
      return db.select().from(faqItems).where(and(...conditions)).orderBy(faqItems.sortOrder);
    },
    []
  );
}

const EMPTY_SEARCH_RESULTS = { blogs: [], events: [], documents: [], faqs: [], services: [] };

export async function searchSite(query: string) {
  return safeQuery(
    "searchSite",
    async () => {
      const like = `%${query}%`;
      const [blogs, evts, docs, faqs, svcs] = await Promise.all([
        db.select().from(blogPosts).where(and(eq(blogPosts.status, "published"), or(ilike(blogPosts.title, like), ilike(blogPosts.shortDescription, like)))).limit(8),
        db.select().from(events).where(and(eq(events.status, "published"), ilike(events.title, like))).limit(8),
        db.select().from(councilDocuments).where(and(eq(councilDocuments.isPublished, true), ilike(councilDocuments.title, like))).limit(8),
        db.select().from(faqItems).where(and(eq(faqItems.isPublished, true), ilike(faqItems.question, like))).limit(8),
        db.select().from(services).where(and(eq(services.isPublished, true), ilike(services.title, like))).limit(8),
      ]);
      return { blogs, events: evts, documents: docs, faqs, services: svcs };
    },
    EMPTY_SEARCH_RESULTS
  );
}
