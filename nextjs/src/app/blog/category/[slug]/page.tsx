/**
 * Архив постов по категории (стандартная таксономия WordPress category)
 *
 * Роут: /blog/category/[slug]
 * Пример: /blog/category/novosti
 *
 * SSG + ISR по образцу service-category и nextjs-wordpress-dynamic-routing
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  getCategoryBySlug,
  getAllCategoriesSlugs,
  getPostsByCategory,
  getWordPressTimezone,
} from "@/lib/wordpress";
import {
  Container,
  Heading,
  Text,
  Breadcrumbs,
} from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

/** Формат даты в часовом поясе WordPress (единый TZ для совпадения сервер/клиент) */
function formatPostDate(dateString: string, timeZone: string): string {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: timeZone || "UTC",
  });
}

interface BlogCategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllCategoriesSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: BlogCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: "Категория не найдена - УниДент" };
  }
  return {
    title: `${category.name} - Блог - УниДент`,
    description:
      category.description ||
      `Записи блога в категории «${category.name}» — стоматологическая клиника УниДент`,
  };
}

export default async function BlogCategoryPage({
  params,
}: BlogCategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [posts, timeZone] = await Promise.all([
    getPostsByCategory(slug, { first: 50 }),
    getWordPressTimezone(),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Блог", href: "/blog" },
    { label: category.name },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Блог", url: `${baseUrl}/blog` },
    {
      name: category.name,
      url: `${baseUrl}/blog/category/${slug}`,
    },
  ];

  return (
    <main id="main-content">
      <Container size="xl" className="py-16">
      <Breadcrumbs items={breadcrumbItems} />
      <BreadcrumbStructuredData items={structuredItems} />

      <Heading
        level={1}
        variant="page-title"
        className="text-unident-dark mb-2"
      >
        {category.name}
      </Heading>

      {category.description && (
        <Text variant="large" className="text-unident-textGray mb-10">
          {category.description}
        </Text>
      )}

      {posts.length === 0 ? (
        <Text variant="default" className="text-unident-textGray">
          В этой категории пока нет записей.
        </Text>
      ) : (
        <ul className="space-y-4" role="list">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-[10px] border border-unident-borderGray p-4 transition-colors hover:border-unident-primary hover:bg-unident-bgElements"
              >
                <Heading level={3} variant="card-title" className="mb-1">
                  {post.title}
                </Heading>
                {post.excerpt && (
                  <div
                    className="text-[14px] font-normal leading-[1.25] text-unident-textGray line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  />
                )}
                <Text variant="xs" className="mt-2 text-unident-textGray">
                  {formatPostDate(post.date, timeZone)}
                </Text>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </Container>
    </main>
  );
}

export const revalidate = 3600;
