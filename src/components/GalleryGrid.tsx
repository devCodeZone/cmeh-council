"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryItemData = {
  id: number;
  title?: string | null;
  type: string; // photo | video
  category?: string | null;
  imagePath?: string | null;
  videoUrl?: string | null;
  thumbnail?: string | null;
};

const TABS = [
  { key: "all", label: "All" },
  { key: "photos", label: "Photos" },
  { key: "events", label: "Events" },
  { key: "seminars", label: "Seminars" },
  { key: "workshops", label: "Workshops" },
  { key: "videos", label: "Videos" },
];

export function GalleryGrid({ items }: { items: GalleryItemData[] }) {
  const [tab, setTab] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    if (tab === "photos") return items.filter((i) => i.type === "photo");
    if (tab === "videos") return items.filter((i) => i.type === "video");
    return items.filter((i) => i.category === tab);
  }, [items, tab]);

  const close = useCallback(() => setLightboxIndex(null), []);
  const next = useCallback(() => setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length)), [filtered.length]);
  const prev = useCallback(() => setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)), [filtered.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, close, next, prev]);

  const active = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border transition-colors focus-ring",
              tab === t.key ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-ink border-brand-border hover:bg-brand-surface-alt"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setLightboxIndex(idx)}
              className="mb-3 block w-full break-inside-avoid rounded-xl overflow-hidden bg-brand-primary-light relative group focus-ring"
            >
              {item.type === "video" ? (
                <div className="aspect-video flex items-center justify-center bg-brand-ink/90 text-white relative">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnail} alt={item.title || ""} className="absolute inset-0 size-full object-cover opacity-60" loading="lazy" />
                  ) : null}
                  <PlayCircle className="size-10 relative z-10" />
                </div>
              ) : item.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imagePath}
                  alt={item.title || ""}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-brand-muted py-12">No items in this category yet.</p>
      )}

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title || "Gallery item"}
          className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4"
          onClick={close}
        >
          <button onClick={close} aria-label="Close" className="absolute top-5 right-5 text-white/80 hover:text-white">
            <X className="size-8" />
          </button>
          {filtered.length > 1 ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous"
                className="absolute left-4 sm:left-8 text-white/80 hover:text-white"
              >
                <ChevronLeft className="size-10" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next"
                className="absolute right-4 sm:right-8 text-white/80 hover:text-white"
              >
                <ChevronRight className="size-10" />
              </button>
            </>
          ) : null}
          <div className="max-w-4xl w-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {active.type === "video" && active.videoUrl ? (
              <div className="aspect-video">
                <iframe
                  src={active.videoUrl}
                  title={active.title || "Video"}
                  className="size-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : active.imagePath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.imagePath} alt={active.title || ""} className="max-h-[85vh] mx-auto rounded-lg object-contain" />
            ) : null}
            {active.title ? <p className="text-white text-center mt-3 text-sm">{active.title}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
