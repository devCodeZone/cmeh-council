"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<{ push: (kind: ToastKind, message: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]" aria-live="polite">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg bg-white text-sm animate-[reveal_0.3s_ease-out]",
              item.kind === "success" && "border-emerald-200",
              item.kind === "error" && "border-red-200",
              item.kind === "info" && "border-blue-200"
            )}
          >
            {item.kind === "success" && <CheckCircle2 className="size-5 text-brand-success shrink-0 mt-0.5" aria-hidden />}
            {item.kind === "error" && <XCircle className="size-5 text-brand-danger shrink-0 mt-0.5" aria-hidden />}
            {item.kind === "info" && <Info className="size-5 text-blue-600 shrink-0 mt-0.5" aria-hidden />}
            <p className="flex-1 text-brand-ink">{item.message}</p>
            <button
              onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
              className="text-brand-muted hover:text-brand-ink focus-ring rounded"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
