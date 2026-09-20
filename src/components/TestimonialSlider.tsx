"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

export type TestimonialData = {
  id: number;
  name: string;
  designation?: string | null;
  location?: string | null;
  quote: string;
  rating?: number | null;
  photoPath?: string | null;
};

export function TestimonialSlider({ items }: { items: TestimonialData[] }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, items.length]);

  if (!items.length) {
    return <p className="text-center text-brand-muted">Testimonials will appear here once published.</p>;
  }

  const item = items[index];

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="rounded-3xl bg-white border border-brand-border shadow-sm p-8 sm:p-12 text-center reveal" key={item.id}>
        <Quote className="size-10 text-brand-accent/40 mx-auto mb-4" aria-hidden />
        <p className="text-lg sm:text-xl text-brand-ink leading-relaxed font-medium">&ldquo;{item.quote}&rdquo;</p>
        {item.rating ? (
          <div className="flex items-center justify-center gap-1 mt-5" aria-label={`${item.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`size-4 ${i < (item.rating || 0) ? "fill-brand-accent text-brand-accent" : "text-brand-border"}`} />
            ))}
          </div>
        ) : null}
        <div className="mt-5">
          <p className="font-semibold text-brand-ink">{item.name}</p>
          <p className="text-sm text-brand-muted">
            {[item.designation, item.location].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      {items.length > 1 ? (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={prev} aria-label="Previous testimonial" className="flex size-10 items-center justify-center rounded-full border border-brand-border hover:bg-brand-surface-alt focus-ring">
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {items.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`size-2 rounded-full transition-colors ${i === index ? "bg-brand-primary" : "bg-brand-border"}`}
              />
            ))}
          </div>
          <button onClick={next} aria-label="Next testimonial" className="flex size-10 items-center justify-center rounded-full border border-brand-border hover:bg-brand-surface-alt focus-ring">
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
