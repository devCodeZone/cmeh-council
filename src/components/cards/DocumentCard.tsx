"use client";

import { FileText, Download, Eye, Calendar } from "lucide-react";
import { formatDate, cn, humanFileSize } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export type DocumentCardData = {
  id: number;
  title: string;
  categoryName?: string | null;
  description?: string | null;
  publicationDate?: string | Date | null;
  fileType?: string | null;
  fileSize?: number | null;
  filePath: string;
};

export function DocumentCard({ doc, className }: { doc: DocumentCardData; className?: string }) {
  return (
    <div className={cn("flex flex-col rounded-2xl border border-brand-border bg-white p-5 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-accent-light text-brand-accent">
          <FileText className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-brand-ink text-[15px] leading-snug line-clamp-2">{doc.title}</h3>
          {doc.categoryName ? (
            <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-wide text-brand-primary bg-brand-primary-light px-2 py-0.5 rounded-full">
              {doc.categoryName}
            </span>
          ) : null}
        </div>
      </div>
      {doc.description ? <p className="text-sm text-brand-body line-clamp-2 mb-3">{doc.description}</p> : null}
      <div className="flex items-center gap-3 text-xs text-brand-muted mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="size-3.5" /> {formatDate(doc.publicationDate)}
        </span>
        <span className="uppercase">{doc.fileType || "file"}</span>
        <span>{humanFileSize(doc.fileSize)}</span>
      </div>
      <div className="mt-auto flex items-center gap-2">
        <a
          href={doc.filePath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-brand-primary/30 text-brand-primary text-sm font-semibold py-2 hover:bg-brand-primary-light focus-ring"
        >
          <Eye className="size-4" /> View
        </a>
        <a
          href={doc.filePath}
          download
          onClick={() => trackEvent("document_download", { title: doc.title })}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-primary text-white text-sm font-semibold py-2 hover:bg-brand-primary-dark focus-ring"
        >
          <Download className="size-4" /> Download
        </a>
      </div>
    </div>
  );
}
