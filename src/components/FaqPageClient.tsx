"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FaqAccordion, type FaqData } from "@/components/FaqAccordion";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "council", label: "Council" },
  { key: "registration", label: "Registration" },
  { key: "documents", label: "Documents" },
  { key: "payments", label: "Payments" },
  { key: "events", label: "Events" },
  { key: "general", label: "General" },
];

export function FaqPageClient({ items }: { items: FaqData[] }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = items;
    if (category !== "all") list = list.filter((i) => i.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q));
    }
    return list;
  }, [items, category, search]);

  return (
    <div>
      <div className="relative max-w-lg mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search FAQs..."
          aria-label="Search FAQs"
          className="w-full pl-10 pr-4 py-3 rounded-full border border-brand-border focus-ring"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-colors focus-ring",
              category === c.key ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-ink border-brand-border hover:bg-brand-surface-alt"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <FaqAccordion items={filtered} />
    </div>
  );
}
