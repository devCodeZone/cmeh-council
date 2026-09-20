"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type Category = { id: number; name: string };

export function DocumentForm({
  mode,
  documentId,
  initial,
}: {
  mode: "create" | "edit";
  documentId?: number;
  initial?: {
    title: string;
    description: string;
    categoryId: number | null;
    publicationDate: string;
    isPublished: boolean;
    isFeatured: boolean;
  };
}) {
  const router = useRouter();
  const { push } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ? String(initial.categoryId) : "");
  const [publicationDate, setPublicationDate] = useState(initial?.publicationDate?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/document-categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  async function addCategory() {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/admin/document-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    const cat = await res.json();
    setCategories((prev) => [...prev, cat]);
    setCategoryId(String(cat.id));
    setNewCategory("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "create" && !file) {
      push("error", "Please choose a file to upload.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("categoryId", categoryId);
      fd.append("publicationDate", publicationDate);
      fd.append("isPublished", String(isPublished));
      fd.append("isFeatured", String(isFeatured));
      if (file) fd.append("file", file);

      const res = await fetch(mode === "create" ? "/api/admin/documents" : `/api/admin/documents/${documentId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        push("error", json.message || "Could not save document.");
        return;
      }
      push("success", mode === "create" ? "Document uploaded and published." : "Document updated.");
      router.push("/admin/informations");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-brand-border bg-white p-6 sm:p-8 space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-brand-ink mb-1.5">Document Title *</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-brand-border px-4 py-2.5 focus-ring" />
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-ink mb-1.5">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-brand-border px-4 py-2.5 focus-ring" />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1.5">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-xl border border-brand-border px-4 py-2.5 bg-white">
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Add new category" className="flex-1 rounded-lg border border-brand-border px-3 py-1.5 text-sm" />
            <button type="button" onClick={addCategory} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary px-2">
              <Plus className="size-3.5" /> Add
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1.5">Publication Date</label>
          <input type="date" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} className="w-full rounded-xl border border-brand-border px-4 py-2.5" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-ink mb-1.5">
          {mode === "create" ? "File (PDF, JPG, PNG) *" : "Replace File (optional)"}
        </label>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-brand-ink">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> Published
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-ink">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand-primary px-6 py-2.5 rounded-full hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {mode === "create" ? "Upload Document" : "Save Changes"}
      </button>
    </form>
  );
}
