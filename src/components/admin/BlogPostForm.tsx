"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ImagePlus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type Category = { id: number; name: string };

type PostData = {
  id?: number;
  title: string;
  slug?: string;
  featuredImage?: string | null;
  shortDescription?: string | null;
  content: string;
  authorName?: string | null;
  categoryId?: number | null;
  tags?: string[];
  status: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
};

export function BlogPostForm({ mode, initial }: { mode: "create" | "edit"; initial?: PostData }) {
  const router = useRouter();
  const { push } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [values, setValues] = useState<PostData>(
    initial || {
      title: "",
      content: "",
      status: "draft",
      authorName: "Council Desk",
      tags: [],
    }
  );
  const [tagsText, setTagsText] = useState((initial?.tags || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/blog-categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function uploadFeaturedImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "blog");
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        push("error", json.message || "Image upload failed.");
        return;
      }
      setValues((v) => ({ ...v, featuredImage: json.path }));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim() || !values.content.trim()) {
      push("error", "Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      const body = { ...values, tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean) };
      const url = mode === "create" ? "/api/admin/blog" : `/api/admin/blog/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        push("error", json.message || "Could not save post.");
        return;
      }
      push("success", mode === "create" ? "Post created." : "Post updated.");
      router.push("/admin/blog");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-brand-border bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Title *</label>
            <input
              required
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">URL Slug (auto-generated if left blank)</label>
            <input
              value={values.slug || ""}
              onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Short Description (for listing cards)</label>
            <textarea
              rows={2}
              value={values.shortDescription || ""}
              onChange={(e) => setValues((v) => ({ ...v, shortDescription: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Content * (HTML or plain text supported)</label>
            <textarea
              required
              rows={16}
              value={values.content}
              onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 font-mono text-sm"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-white p-6 space-y-4">
          <h3 className="font-semibold text-brand-ink">SEO</h3>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">SEO Title</label>
            <input
              value={values.seoTitle || ""}
              onChange={(e) => setValues((v) => ({ ...v, seoTitle: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Meta Description</label>
            <textarea
              rows={2}
              value={values.metaDescription || ""}
              onChange={(e) => setValues((v) => ({ ...v, metaDescription: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">Focus Keyword</label>
              <input
                value={values.focusKeyword || ""}
                onChange={(e) => setValues((v) => ({ ...v, focusKeyword: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1.5">Canonical URL</label>
              <input
                value={values.canonicalUrl || ""}
                onChange={(e) => setValues((v) => ({ ...v, canonicalUrl: e.target.value }))}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-brand-border bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Status</label>
            <select
              value={values.status}
              onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Category</label>
            <select
              value={values.categoryId ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, categoryId: e.target.value ? Number(e.target.value) : null }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 bg-white"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Author Name</label>
            <input
              value={values.authorName || ""}
              onChange={(e) => setValues((v) => ({ ...v, authorName: e.target.value }))}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Tags (comma separated)</label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1.5">Featured Image</label>
            {values.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={values.featuredImage} alt="" className="w-full h-32 rounded-lg object-cover mb-2" />
            ) : null}
            <label className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary cursor-pointer">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {values.featuredImage ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFeaturedImage(file);
                }}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-brand-primary py-3 rounded-full hover:bg-brand-primary-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {mode === "create" ? "Publish Post" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
