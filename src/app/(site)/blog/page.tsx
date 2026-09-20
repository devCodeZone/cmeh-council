import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/cards/BlogCard";
import { cn } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";
import { getBlogPosts, getBlogCategories } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pagePath: "/blog",
    title: "Blog & Announcements",
    description: "News, announcements and educational articles from Electrohomeopath Council Patna.",
  });
}

export default async function BlogListPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const activeCategory = category || "all";
  const [posts, categories] = await Promise.all([getBlogPosts(activeCategory), getBlogCategories()]);

  return (
    <>
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <section className="py-16">
        <div className="container-page">
          <SectionHeading as="h1" eyebrow="Latest Updates" title="Blog & Announcements" />
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            <Link
              href="/blog"
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                activeCategory === "all" ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-ink border-brand-border hover:bg-brand-surface-alt"
              )}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  activeCategory === cat.slug ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-ink border-brand-border hover:bg-brand-surface-alt"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {posts.length ? (
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-brand-muted">No articles published in this category yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
