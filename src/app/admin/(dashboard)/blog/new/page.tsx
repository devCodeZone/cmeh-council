import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary mb-4">
        <ArrowLeft className="size-4" /> Back to Blog Posts
      </Link>
      <h1 className="text-2xl font-bold text-brand-ink mb-6">Add New Blog Post</h1>
      <BlogPostForm mode="create" />
    </div>
  );
}
