"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { formatDate, humanFileSize } from "@/lib/utils";

type Doc = {
  id: number;
  title: string;
  categoryName: string | null;
  fileType: string | null;
  fileSize: number | null;
  publicationDate: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  filePath: string;
};

export default function AdminInformationsPage() {
  const { push } = useToast();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/documents");
    setDocs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublish(doc: Doc) {
    const fd = new FormData();
    fd.append("isPublished", String(!doc.isPublished));
    await fetch(`/api/admin/documents/${doc.id}`, { method: "PATCH", body: fd });
    push("success", doc.isPublished ? "Document unpublished." : "Document published.");
    load();
  }

  async function remove(doc: Doc) {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/documents/${doc.id}`, { method: "DELETE" });
    push("success", "Document deleted.");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-ink">Informations / Documents</h1>
        <Link href="/admin/informations/new" className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-primary text-white px-4 py-2 rounded-full hover:bg-brand-primary-dark">
          <Plus className="size-4" /> Upload New
        </Link>
      </div>

      <div className="rounded-2xl border border-brand-border bg-white overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-brand-muted">
            <Loader2 className="size-6 animate-spin mx-auto" />
          </div>
        ) : docs.length ? (
          <table className="w-full text-sm">
            <thead className="bg-brand-surface-alt text-left text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-brand-surface-alt/60">
                  <td className="px-4 py-3 font-medium text-brand-ink">{doc.title}</td>
                  <td className="px-4 py-3">{doc.categoryName || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(doc.publicationDate)}</td>
                  <td className="px-4 py-3 uppercase">{doc.fileType}</td>
                  <td className="px-4 py-3">{humanFileSize(doc.fileSize)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${doc.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {doc.isPublished ? "Published" : "Unpublished"}
                    </span>
                    {doc.isFeatured ? <span className="ml-1 px-2 py-1 rounded-full text-xs font-semibold bg-brand-accent-light text-brand-accent">Featured</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <a href={doc.filePath} target="_blank" rel="noopener noreferrer" title="View" className="text-brand-muted hover:text-brand-primary">
                        <ExternalLink className="size-4" />
                      </a>
                      <button onClick={() => togglePublish(doc)} title={doc.isPublished ? "Unpublish" : "Publish"} className="text-brand-muted hover:text-brand-primary">
                        {doc.isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                      <Link href={`/admin/informations/${doc.id}/edit`} title="Edit" className="text-brand-muted hover:text-brand-primary">
                        <Pencil className="size-4" />
                      </Link>
                      <button onClick={() => remove(doc)} title="Delete" className="text-brand-muted hover:text-brand-danger">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-10 text-center text-brand-muted">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
