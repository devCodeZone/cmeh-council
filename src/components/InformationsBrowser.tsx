"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DocumentCard, type DocumentCardData } from "@/components/cards/DocumentCard";

export type DocCategory = { id: number; name: string; slug: string };

export function InformationsBrowser({
  documents,
  categories,
}: {
  documents: (DocumentCardData & { categorySlug?: string | null })[];
  categories: DocCategory[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"latest" | "oldest" | "alpha">("latest");

  const filtered = useMemo(() => {
    let list = documents;
    if (activeCategory !== "all") {
      list = list.filter((d) => d.categorySlug === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q) || (d.description || "").toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "latest") {
      sorted.sort((a, b) => new Date(b.publicationDate || 0).getTime() - new Date(a.publicationDate || 0).getTime());
    } else if (sort === "oldest") {
      sorted.sort((a, b) => new Date(a.publicationDate || 0).getTime() - new Date(b.publicationDate || 0).getTime());
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [documents, activeCategory, search, sort]);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")} label="All" />
          {categories.map((cat) => (
            <FilterChip key={cat.id} active={activeCategory === cat.slug} onClick={() => setActiveCategory(cat.slug)} label={cat.name} />
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Documents"
              aria-label="Search documents"
              className="pl-9 pr-3 py-2 rounded-full border border-brand-border text-sm w-56 focus-ring"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Sort documents"
            className="py-2 px-3 rounded-full border border-brand-border text-sm focus-ring bg-white"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {filtered.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <p className="text-center text-brand-muted py-12">No documents match your search. Try a different filter or keyword.</p>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors focus-ring ${
        active ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-ink border-brand-border hover:bg-brand-surface-alt"
      }`}
    >
      {label}
    </button>
  );
}
