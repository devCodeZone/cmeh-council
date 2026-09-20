import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEP_LABELS } from "@/lib/registration-constants";

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-0 mb-10" aria-label="Registration progress">
      {STEP_LABELS.map((label, idx) => {
        const stepNum = idx + 1;
        const state = stepNum < current ? "done" : stepNum === current ? "active" : "pending";
        return (
          <li key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5 w-20 sm:w-24">
              <span
                className={cn(
                  "flex size-8 sm:size-9 items-center justify-center rounded-full text-xs font-bold border-2 transition-colors",
                  state === "done" && "bg-brand-primary border-brand-primary text-white",
                  state === "active" && "border-brand-primary text-brand-primary bg-white",
                  state === "pending" && "border-brand-border text-brand-muted bg-white"
                )}
                aria-current={state === "active" ? "step" : undefined}
              >
                {state === "done" ? <Check className="size-4" /> : stepNum}
              </span>
              <span className={cn("text-[10px] sm:text-xs text-center leading-tight", state === "active" ? "text-brand-ink font-semibold" : "text-brand-muted")}>
                {label}
              </span>
            </div>
            {stepNum !== STEP_LABELS.length ? (
              <span className={cn("hidden sm:block h-0.5 w-6 md:w-10 mx-1", state === "done" ? "bg-brand-primary" : "bg-brand-border")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
