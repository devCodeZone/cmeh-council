import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
  as?: "h1" | "h2";
}) {
  const Heading = as;
  return (
    <div className={cn("max-w-3xl reveal", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow ? (
        <span className="inline-block text-xs font-bold tracking-widest uppercase text-brand-accent mb-3">
          {eyebrow}
        </span>
      ) : null}
      <Heading className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-ink text-balance">
        {title}
      </Heading>
      {description ? (
        <p className="mt-4 text-base sm:text-lg text-brand-body leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
