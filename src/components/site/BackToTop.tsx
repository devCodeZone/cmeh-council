"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 left-5 z-50 flex size-11 items-center justify-center rounded-full bg-brand-ink/90 text-white shadow-lg hover:bg-brand-ink transition-colors focus-ring"
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
