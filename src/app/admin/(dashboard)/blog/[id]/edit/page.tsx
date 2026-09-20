import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, Number(id)));
  if (!row) notFound();

  return (
    <div>
      <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary mb-4">
        <ArrowLeft className="size-4" /> Back to Blog Posts
      </Link>
      <h1 className="text-2xl font-bold text-brand-ink mb-6">Edit Blog Post</h1>
      <BlogPostForm mode="edit" initial={{ ...row, tags: row.tags || [] }} />
    </div>
  );
}
