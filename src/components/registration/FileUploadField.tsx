"use client";

import { useRef } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_MB_CLIENT } from "@/lib/registration-constants";

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".pdf"];

export function FileUploadField({
  label,
  required,
  multiple,
  files,
  onChange,
  error,
}: {
  label: string;
  required?: boolean;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const valid: File[] = [];
    for (const file of incoming) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        continue;
      }
      if (file.size > MAX_UPLOAD_MB_CLIENT * 1024 * 1024) {
        continue;
      }
      valid.push(file);
    }
    onChange(multiple ? [...files, ...valid] : valid.slice(0, 1));
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(idx: number) {
    onChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-brand-ink mb-1.5">
        {label} {required ? <span className="text-brand-danger">*</span> : null}
      </label>
      <div
        className="rounded-xl border-2 border-dashed border-brand-border p-4 text-center hover:border-brand-primary/50 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <UploadCloud className="size-6 mx-auto text-brand-muted mb-1.5" />
        <p className="text-sm text-brand-body">
          <span className="text-brand-primary font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-brand-muted mt-1">JPG, JPEG, PNG or PDF, up to {MAX_UPLOAD_MB_CLIENT}MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error ? <p className="text-sm text-brand-danger mt-1">{error}</p> : null}
      {files.length ? (
        <ul className="mt-3 space-y-2">
          {files.map((file, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm bg-brand-surface-alt rounded-lg px-3 py-2">
              <FileText className="size-4 text-brand-primary shrink-0" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-brand-muted shrink-0">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                aria-label={`Remove ${file.name}`}
                className="text-brand-muted hover:text-brand-danger shrink-0"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
