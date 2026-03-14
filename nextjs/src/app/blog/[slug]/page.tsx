/**
 * Динамическая страница поста (записи WordPress)
 *
 * Роут: /blog/[slug]
 *
 * Архитектура (сверху вниз):
 * 1. Breadcrumbs
 * 2. Hero Section (категории, заголовок, дата, featured image)
 * 3. Two-Column Layout:
 *    - Left: ACF Blocks content
 *    - Right: Sticky Sidebar (Share Buttons + CTA Form)
 * 4. Related Posts Slider
 *
 * PERFORMANCE:
 * - SSG с generateStaticParams
 * - ISR: revalidate каждый час
 * - Server Component — zero JS на клиенте (кроме form + slider)
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import {
  getPostBySlug,
  getAllPostsSlugs,
  getRelatedPostsForCards,
} from "@/lib/wordpress";
import { Heading, Text, Breadcrumbs, Section } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import { BlockRenderer } from "@/components/blocks";
import { ShareButtons } from "@/components/figma/blog/share-buttons";
import { PostSidebar } from "@/components/figma/blog/post-sidebar";
import { BlogSectionClient } from "@/components/sections/blog-section-client";
import type { BlogPostCard } from "@/types/blog";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostsSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("[generateStaticParams] blog Error:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Не найдено - УниДент" };
  }

  const description =
    post.excerpt?.replace(/<[^>]+>/g, "").slice(0, 160) ||
    `Запись ${post.title} в блоге стоматологической клиники УниДент`;

  return {
    title: `${post.title} - УниДент`,
    description,
    openGraph: {
      title: `${post.title} | УниДент`,
      description,
      type: "article",
      publishedTime: post.date,
      ...(post.featuredImage?.node?.sourceUrl && {
        images: [{ url: post.featuredImage.node.sourceUrl }],
      }),
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru"}/blog/${slug}`,
    },
  };
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const postUrl = `${baseUrl}/blog/${slug}`;

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Блог", href: "/blog" },
    { label: post.title },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Блог", url: `${baseUrl}/blog` },
    { name: post.title, url: postUrl },
  ];

  const hasBlocks = post.contentBlocks && post.contentBlocks.length > 0;
  const categories = post.categories?.nodes || [];

  // Fetch related posts in parallel (by category)
  const categoryIds = categories.map((c) => c.slug);
  const relatedPosts: BlogPostCard[] = categoryIds.length
    ? await getRelatedPostsForCards(categoryIds, [post.id], 6)
    : [];

  return (
    <main id="main-content" className="min-h-screen bg-white">
      <BreadcrumbStructuredData items={structuredItems} />

      {/* 1. Hero / Header */}
      <section className="bg-unident-bgElements">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10 py-8 md:py-12">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <div className="flex-1">
              {categories.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat.slug}
                      className="rounded-full bg-unident-primary/10 px-3 py-1 text-[13px] font-medium text-unident-primary"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <Heading level={1} variant="page-title">
                {post.title}
              </Heading>

              <div className="mt-4 flex items-center gap-4">
                <Text as="span" variant="small" className="text-unident-textGray">
                  {formatDate(post.date)}
                </Text>
                {post.author?.node?.name && (
                  <Text as="span" variant="small" className="text-unident-textGray">
                    {post.author.node.name}
                  </Text>
                )}
              </div>
            </div>

            {post.featuredImage?.node?.sourceUrl && (
              <div className="lg:w-[440px] lg:flex-shrink-0">
                <Image
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || post.title}
                  width={880}
                  height={500}
                  priority
                  className="w-full rounded-[25px] object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Two-Column Layout: Content + Sticky Sidebar */}
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row lg:gap-10">
          {/* Left: Content + Share block (under content) */}
          <div className="flex-1 min-w-0 max-w-[800px] flex flex-col gap-8">
            <article>
              {hasBlocks ? (
                <BlockRenderer blocks={post.contentBlocks!} />
              ) : post.content ? (
                <div
                  className="font-gilroy text-[16px] leading-[1.6] text-unident-dark prose prose-headings:font-gilroy prose-headings:text-unident-dark prose-a:text-unident-primary max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : null}
            </article>

            {/* Share block — под контентом в левой колонке */}
            {post.shareButtons && post.shareButtons.length > 0 && (
              <ShareButtons buttons={post.shareButtons} postUrl={postUrl} />
            )}
          </div>

          {/* Right: Sticky Sidebar (только CTA форма) */}
          <aside className="mt-10 lg:mt-0 lg:w-[418px] lg:flex-shrink-0 lg:self-start lg:sticky lg:top-[230px]">
            <PostSidebar
              ctaOverride={post.ctaOverride}
              postUrl={postUrl}
            />
          </aside>
        </div>
      </div>

      {/* 3. Related Posts Slider */}
      {relatedPosts.length > 0 && (
        <Section className="bg-white py-12 md:py-16">
          <BlogSectionClient
            posts={relatedPosts}
            title="Читайте также"
            showJournalButton={false}
          />
        </Section>
      )}
    </main>
  );
}

export const revalidate = 3600;
