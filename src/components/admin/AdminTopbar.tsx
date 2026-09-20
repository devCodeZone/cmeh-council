"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, LogOut, ExternalLink } from "lucide-react";

export function AdminTopbar({
  userName,
  role,
  onMenuClick,
}: {
  userName: string;
  role: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-brand-border">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden flex size-9 items-center justify-center rounded-lg border border-brand-border">
            <Menu className="size-4" />
          </button>
          <div>
            <p className="text-sm font-semibold text-brand-ink leading-none">{userName}</p>
            <p className="text-xs text-brand-muted capitalize mt-0.5">{role.replace(/_/g, " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary px-3 py-2"
          >
            <ExternalLink className="size-4" /> View Website
          </a>
          <button
            onClick={logout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-danger px-4 py-2 rounded-full hover:brightness-95 disabled:opacity-60"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
