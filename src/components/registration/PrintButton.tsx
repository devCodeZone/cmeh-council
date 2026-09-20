"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-brand-primary border border-brand-primary/30 hover:bg-brand-primary-light font-semibold px-5 py-3 text-sm focus-ring"
    >
      <Printer className="size-4" /> Print Application
    </button>
  );
}
