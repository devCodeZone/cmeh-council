import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";

export function ServiceCard({
  title,
  slug,
  icon,
  shortDescription,
}: {
  title: string;
  slug: string;
  icon?: string | null;
  shortDescription?: string | null;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-brand-border bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-primary text-white mb-5">
        <DynamicIcon name={icon} className="size-6" />
      </div>
      <h3 className="font-semibold text-brand-ink text-lg mb-2">{title}</h3>
      <p className="text-sm text-brand-body leading-relaxed flex-1">{shortDescription}</p>
      <Link href={`/services#${slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
        Learn More <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
