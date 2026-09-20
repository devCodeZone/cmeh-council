import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-brand-primary-light text-brand-primary",
    success: "bg-emerald-50 text-brand-success",
    warning: "bg-amber-50 text-brand-warning",
    danger: "bg-red-50 text-brand-danger",
  };
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-5 flex items-center gap-4">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-brand-ink leading-none">{value}</p>
        <p className="text-xs text-brand-muted mt-1.5 truncate">{label}</p>
      </div>
    </div>
  );
}
