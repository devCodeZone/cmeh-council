import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-ring"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary mb-5 group-hover:bg-brand-primary group-hover:text-white transition-colors">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="font-semibold text-brand-ink text-lg mb-2">{title}</h3>
      <p className="text-sm text-brand-body leading-relaxed flex-1">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
        {cta}
        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" aria-hidden />
      </span>
    </Link>
  );
}
