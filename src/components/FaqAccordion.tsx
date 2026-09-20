"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqData = { id: number; question: string; answer: string; category?: string | null };

export function FaqAccordion({ items }: { items: FaqData[] }) {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null);

  if (!items.length) {
    return <p className="text-center text-brand-muted">No FAQs published yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="rounded-xl border border-brand-border bg-white overflow-hidden">
            <h3>
              <button
                onClick={() => setOpenId(open ? null : item.id)}
                aria-expanded={open}
                aria-controls={`faq-panel-${item.id}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-brand-ink hover:bg-brand-surface-alt focus-ring"
              >
                <span>{item.question}</span>
                <ChevronDown className={cn("size-5 shrink-0 text-brand-muted transition-transform", open && "rotate-180")} />
              </button>
            </h3>
            <div
              id={`faq-panel-${item.id}`}
              role="region"
              hidden={!open}
              className="px-5 pb-4 text-sm text-brand-body leading-relaxed"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
