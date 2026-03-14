import { Metadata } from "next";
import {
  Container,
  Heading,
  Breadcrumbs,
} from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import {
  getPostsConnection,
  getAllCategories,
} from "@/lib/wordpress/api";
import { BlogHeroSliderClient } from "@/components/sections/blog-hero-slider-client";
import { BlogCategoryFilters } from "@/components/sections/blog-category-filters";
import { BlogArchiveSectionClient } from "@/components/sections/blog-archive-section-client";

export const metadata: Metadata = {
  title: "Блог - УниДент",
  description: "Статьи и новости стоматологической клиники УниДент",
};

export const revalidate = 3600;

const BREADCRUMB_ITEMS = [{ label: "Главная", href: "/" }, { label: "Блог" }];

const HERO_POSTS_COUNT = 6;
const GRID_POSTS_COUNT = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const structuredItems = [
    { name: "Главная", url: baseUrl + "/" },
    { name: "Блог", url: baseUrl + "/blog" },
  ];

  const resolved = await searchParams;
  const rawCategory = resolved?.category;
  const categorySlug =
    typeof rawCategory === "string"
      ? rawCategory.trim()
      : Array.isArray(rawCategory)
        ? rawCategory[0]?.trim()
        : undefined;

  const filters =
    categorySlug && categorySlug.length > 0
      ? { categorySlug }
      : undefined;

  const [heroResult, gridResult, categories] = await Promise.all([
    getPostsConnection(HERO_POSTS_COUNT, undefined, filters),
    getPostsConnection(GRID_POSTS_COUNT, undefined, filters),
    getAllCategories(),
  ]);

  const heroPosts = heroResult.posts;
  const gridPosts = gridResult.posts;
  const pageInfo = gridResult.pageInfo;

  return (
    <main id="main-content">
      <Container size="xl" className="py-16">
      <div className="flex flex-col gap-5 lg:gap-[20px]">
        <Breadcrumbs items={BREADCRUMB_ITEMS} />
        <BreadcrumbStructuredData items={structuredItems} />

        <Heading
          level={2}
          variant="section-title"
          className="text-unident-dark"
        >
          Блог
        </Heading>

        {heroPosts.length > 0 && (
          <BlogHeroSliderClient posts={heroPosts} />
        )}

        <BlogCategoryFilters categories={categories} />

        <BlogArchiveSectionClient
          initialPosts={gridPosts}
          initialPageInfo={pageInfo}
          initialFilters={filters ?? {}}
          categories={categories}
        />
      </div>
      </Container>
    </main>
  );
}
