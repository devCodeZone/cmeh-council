"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export function AdminShell({
  userName,
  role,
  orgShortName,
  children,
}: {
  userName: string;
  role: string;
  orgShortName: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-brand-ink">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-white font-bold text-sm">{orgShortName}</p>
          <p className="text-white/50 text-xs">Admin Dashboard</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AdminSidebar />
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-ink flex flex-col">
            <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">{orgShortName}</p>
                <p className="text-white/50 text-xs">Admin Dashboard</p>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/70">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AdminSidebar />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar userName={userName} role={role} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 bg-brand-surface-alt">{children}</main>
      </div>
    </div>
  );
}
