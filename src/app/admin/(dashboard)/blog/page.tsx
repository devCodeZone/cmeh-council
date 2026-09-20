"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, FolderCog } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

type Post = {
  id: number;
  title: string;
  categoryName: string | null;
  authorName: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
};

export default function AdminBlogPage() {
  const { push } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    setPosts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(post: Post) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    push("success", "Post deleted.");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Blog Posts</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/blog/categories" className="inline-flex items-center gap-2 text-sm font-semibold border border-brand-border px-4 py-2 rounded-full hover:bg-brand-surface-alt">
            <FolderCog className="size-4" /> Categories
          </Link>
          <Link href="/admin/blog/new" className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-primary text-white px-4 py-2 rounded-full hover:bg-brand-primary-dark">
            <Plus className="size-4" /> Add New
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-brand-muted">
            <Loader2 className="size-6 animate-spin mx-auto" />
          </div>
        ) : posts.length ? (
          <table className="w-full text-sm">
            <thead className="bg-brand-surface-alt text-left text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-brand-surface-alt/60">
                  <td className="px-4 py-3 font-medium text-brand-ink">{post.title}</td>
                  <td className="px-4 py-3">{post.categoryName || "—"}</td>
                  <td className="px-4 py-3">{post.authorName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${post.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(post.publishedAt || post.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/blog/${post.id}/edit`} title="Edit" className="text-brand-muted hover:text-brand-primary">
                        <Pencil className="size-4" />
                      </Link>
                      <button onClick={() => remove(post)} title="Delete" className="text-brand-muted hover:text-brand-danger">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-brand-muted">No blog posts yet. Click &ldquo;Add New&rdquo; to create one.</p>
        )}
      </div>
    </div>
  );
}
