import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogCategories } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

export async function GET() {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const rows = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      featuredImage: blogPosts.featuredImage,
      shortDescription: blogPosts.shortDescription,
      authorName: blogPosts.authorName,
      categoryId: blogPosts.categoryId,
      categoryName: blogCategories.name,
      status: blogPosts.status,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .orderBy(desc(blogPosts.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  if (!body.title || !body.content) {
    return NextResponse.json({ message: "Title and content are required." }, { status: 400 });
  }

  const slugBase = body.slug ? slugify(body.slug) : slugify(body.title);
  const status = body.status === "published" ? "published" : "draft";

  const [row] = await db
    .insert(blogPosts)
    .values({
      title: body.title,
      slug: slugBase,
      featuredImage: body.featuredImage || null,
      shortDescription: body.shortDescription || null,
      content: body.content,
      authorName: body.authorName || "Council Desk",
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      tags: Array.isArray(body.tags) ? body.tags : body.tags ? String(body.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      status,
      seoTitle: body.seoTitle || null,
      metaDescription: body.metaDescription || null,
      focusKeyword: body.focusKeyword || null,
      canonicalUrl: body.canonicalUrl || null,
      publishedAt: status === "published" ? new Date() : null,
    })
    .returning();

  await logAudit({ action: "blog_post.created", userId: guard.session.userId, userName: guard.session.name, entityType: "blog_post", entityId: row.id, details: { title: row.title } });

  return NextResponse.json(row);
}
