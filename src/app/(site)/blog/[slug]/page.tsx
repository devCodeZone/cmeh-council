import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, User } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BlogCard } from "@/components/cards/BlogCard";
import { JsonLd } from "@/components/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const row = await getBlogPostBySlug(slug);
  if (!row) return buildMetadata({ pagePath: `/blog/${slug}`, title: "Article Not Found", description: "This article could not be found." });
  const { post } = row;
  return buildMetadata({
    pagePath: `/blog/${slug}`,
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.shortDescription || "",
    ogImage: post.featuredImage || undefined,
  });
}

export default async function BlogDetailPage({ params }: Params) {
  const { slug } = await params;
  const row = await getBlogPostBySlug(slug);
  if (!row) notFound();
  const { post, categoryName } = row;
  const settings = await getSettings();
  const related = await getRelatedBlogPosts(post.categoryId, post.id);

  return (
    <>
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
      <article className="py-16">
        <div className="container-page max-w-3xl">
          {categoryName ? <span className="text-xs font-bold uppercase tracking-wide text-brand-accent">{categoryName}</span> : null}
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-ink mt-2 mb-5">{post.title}</h1>
          <div className="flex items-center gap-5 text-sm text-brand-muted mb-8">
            <span className="flex items-center gap-1.5">
              <User className="size-4" /> {post.authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {formatDate(post.publishedAt)}
            </span>
          </div>
          {post.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.featuredImage} alt="" className="w-full rounded-2xl mb-8 aspect-video object-cover" />
          ) : null}
          <div className="prose-content text-brand-body leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: post.content }} />
          {post.tags && post.tags.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium bg-brand-surface-alt text-brand-body px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>

      {related.length ? (
        <section className="py-16 bg-brand-surface-alt">
          <div className="container-page">
            <h2 className="text-2xl font-bold text-brand-ink text-center mb-10">Related Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.shortDescription || undefined,
          image: post.featuredImage || undefined,
          author: { "@type": "Organization", name: post.authorName || settings.orgName },
          publisher: { "@type": "Organization", name: settings.orgName },
          datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
          dateModified: new Date(post.updatedAt).toISOString(),
          mainEntityOfPage: `${settings.url}/blog/${post.slug}`,
        }}
      />
    </>
  );
}
