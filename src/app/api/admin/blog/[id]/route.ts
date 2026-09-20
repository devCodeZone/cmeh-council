import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, Number(id)));
  if (!row) return NextResponse.json({ message: "Not found." }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  if (!body.title || !body.content) {
    return NextResponse.json({ message: "Title and content are required." }, { status: 400 });
  }

  const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, Number(id)));
  if (!existing) return NextResponse.json({ message: "Not found." }, { status: 404 });

  const status = body.status === "published" ? "published" : "draft";
  const becomingPublished = status === "published" && existing.status !== "published";

  await db
    .update(blogPosts)
    .set({
      title: body.title,
      slug: body.slug ? slugify(body.slug) : existing.slug,
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
      publishedAt: becomingPublished ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, Number(id)));

  await logAudit({ action: "blog_post.updated", userId: guard.session.userId, userName: guard.session.name, entityType: "blog_post", entityId: Number(id) });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminSession("content_editor");
  if ("error" in guard) return guard.error;

  const { id } = await params;
  await db.delete(blogPosts).where(eq(blogPosts.id, Number(id)));
  await logAudit({ action: "blog_post.deleted", userId: guard.session.userId, userName: guard.session.name, entityType: "blog_post", entityId: Number(id) });

  return NextResponse.json({ ok: true });
}
