import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";

export type BlogCardData = {
  slug: string;
  title: string;
  shortDescription?: string | null;
  featuredImage?: string | null;
  categoryName?: string | null;
  publishedAt?: string | Date | null;
};

export function BlogCard({ post }: { post: BlogCardData }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-brand-border bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`} className="block aspect-[16/10] bg-brand-primary-light relative overflow-hidden">
        {post.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featuredImage} alt="" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="size-full flex items-center justify-center text-brand-primary/40 text-sm font-medium">
            Electrohomeopath Council Patna
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        {post.categoryName ? (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-accent mb-2">{post.categoryName}</span>
        ) : null}
        <h3 className="font-semibold text-brand-ink text-lg leading-snug mb-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-brand-primary focus-ring rounded">
            {post.title}
          </Link>
        </h3>
        {post.shortDescription ? (
          <p className="text-sm text-brand-body leading-relaxed flex-1">{truncate(post.shortDescription, 120)}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-brand-muted">
            <CalendarDays className="size-3.5" /> {formatDate(post.publishedAt)}
          </span>
          <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary">
            Read More <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
