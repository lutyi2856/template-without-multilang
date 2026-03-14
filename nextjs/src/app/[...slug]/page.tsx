import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getApolloClient } from "@/lib/wordpress/client";
import { GET_PAGE_BY_SLUG, GET_ALL_PAGES_SLUGS } from "@/lib/wordpress/queries";
import type { PageBySlugResponse, AllPagesSlugsResponse } from "@/types/page";
import { Container, Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import Link from "next/link";

/**
 * Catch-all динамический роутинг для WordPress страниц
 *
 * Обрабатывает:
 * - /about/ → родительская страница
 * - /about/history/ → дочерняя страница
 * - /about/team/ → дочерняя страница
 *
 * Приоритет роутов:
 * 1. Статические сегменты (/doctors, /services) - самый высокий
 * 2. Динамические сегменты ([id])
 * 3. Catch-all ([...slug]) - самый низкий (этот файл)
 *
 * PERFORMANCE:
 * - Server Component (без 'use client')
 * - ISR: revalidate каждый час
 * - generateStaticParams для SSG
 */

// ISR: Revalidate каждый час
export const revalidate = 3600;

/**
 * Статические роуты которые НЕ должны обрабатываться этим catch-all
 * Next.js автоматически даст им приоритет, но для безопасности добавляем проверку
 */
const STATIC_ROUTES = [
  "blog",
  "doctors",
  "services",
  "contacts",
  "reviews",
  "promotions",
  "prices",
  "patients",
  "cases",
  "our-works",
  "problematics",
];

/** Пути статических ассетов — не запрашивать GraphQL (favicon, icons и т.д.) */
const STATIC_ASSET_PREFIXES = ["icons", "favicon", "apple-touch-icon", "manifest"];

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * generateStaticParams - генерация статических страниц для всех WordPress Pages
 */
export async function generateStaticParams() {
  const client = getApolloClient();

  try {
    const { data } = await client.query<AllPagesSlugsResponse>({
      query: GET_ALL_PAGES_SLUGS,
      fetchPolicy: "network-only",
    });

    // Возвращаем все страницы
    return data.pages.nodes.map((page) => {
      // Разбиваем URI на части: /about/history/ → ['about', 'history']
      const slugParts = page.uri.split("/").filter((part) => part.length > 0);

      return {
        slug: slugParts,
      };
    });
  } catch (error) {
    console.error("[generateStaticParams] Error fetching pages:", error);
    return [];
  }
}

/**
 * generateMetadata - генерация метаданных для SEO
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const uri = `/${slug.join("/")}/`;

  if (
    slug[0] &&
    STATIC_ASSET_PREFIXES.includes(slug[0].toLowerCase())
  ) {
    return { title: "Страница не найдена - УниДент" };
  }

  const client = getApolloClient();
  console.log("[generateMetadata] Requesting page with URI:", uri);

  try {
    const { data, errors } = await client.query<PageBySlugResponse>({
      query: GET_PAGE_BY_SLUG,
      variables: { slug: uri },
      fetchPolicy: "network-only",
    });

    console.log(
      "[generateMetadata] GraphQL data:",
      JSON.stringify(data, null, 2),
    );
    console.log(
      "[generateMetadata] GraphQL errors:",
      JSON.stringify(errors, null, 2),
    );

    if (!data?.page) {
      console.log("[generateMetadata] Page not found in response", {
        uri,
        hasData: !!data,
        errors: errors ?? null,
      });
      return {
        title: "Страница не найдена - УниДент",
      };
    }

    const page = data.page;
    const seoTitle = page.seo?.title || page.title;
    const seoDescription = page.seo?.description || "";

    return {
      title: `${seoTitle} - УниДент`,
      description: seoDescription,
      openGraph: {
        title: page.seo?.openGraph?.title || seoTitle,
        description: page.seo?.openGraph?.description || seoDescription,
        images: page.seo?.openGraph?.image?.url
          ? [{ url: page.seo.openGraph.image.url }]
          : page.featuredImage?.node.sourceUrl
            ? [{ url: page.featuredImage.node.sourceUrl }]
            : [],
      },
    };
  } catch (error) {
    console.error("[generateMetadata] Error:", error);
    return {
      title: "Страница не найдена - УниДент",
    };
  }
}

/**
 * PageComponent - компонент для отображения WordPress страницы
 */
export default async function PageComponent({ params }: PageProps) {
  const { slug } = await params;
  const uri = `/${slug.join("/")}/`;

  if (
    slug[0] &&
    STATIC_ASSET_PREFIXES.includes(slug[0].toLowerCase())
  ) {
    notFound();
  }

  const client = getApolloClient();

  // Защита: если это статический роут - возвращаем 404
  // (Next.js и так даст приоритет статическим роутам, но для безопасности)
  if (slug.length === 1 && STATIC_ROUTES.includes(slug[0])) {
    console.log(
      `[PageComponent] Static route detected: ${slug[0]}, returning 404`,
    );
    notFound();
  }

  try {
    console.log("[PageComponent] Requesting page with URI:", uri);
    const { data, errors } = await client.query<PageBySlugResponse>({
      query: GET_PAGE_BY_SLUG,
      variables: { slug: uri },
      fetchPolicy: "network-only",
    });

    if (!data?.page) {
      console.log("[PageComponent] Page not found, returning 404", {
        uri,
        hasData: !!data,
        errors: errors ?? null,
      });
      notFound();
    }

    console.log("[PageComponent] Data received:", {
      hasPage: true,
      title: data.page?.title,
    });

    const page = data.page;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
    const isNestedPage = slug.length > 1;

    let breadcrumbItems: Array<{ label: string; href?: string }>;
    if (slug.length > 1) {
      // blog/services/[slug] → Главная > Услуги > [название]
      if (slug[0] === "blog" && slug[1] === "services") {
        breadcrumbItems = [
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: page.title },
        ];
      } else {
        breadcrumbItems = [
          { label: "Главная", href: "/" },
          {
            label: slug[0] === "about" ? "О клинике" : slug[0],
            href: `/${slug[0]}/`,
          },
          { label: page.title },
        ];
      }
    } else {
      breadcrumbItems = [{ label: "Главная", href: "/" }, { label: page.title }];
    }

    const currentPath = `/${slug.join("/")}/`;
    const breadcrumbStructuredItems = breadcrumbItems.map((item) => ({
      name: item.label,
      url: item.href ? `${baseUrl}${item.href}` : `${baseUrl}${currentPath}`,
    }));

    return (
      <main id="main-content">
        <Container size="xl" className="py-16">
          <Breadcrumbs items={breadcrumbItems} />
        <BreadcrumbStructuredData items={breadcrumbStructuredItems} />

        {/* Заголовок страницы */}
        <h1 className="mb-8 font-gilroy text-4xl font-bold text-unident-dark md:text-5xl">
          {page.title}
        </h1>

        {/* Featured Image (если есть) */}
        {page.featuredImage && (
          <div className="mb-8 relative w-full aspect-video max-h-[400px] overflow-hidden rounded-[20px]">
            <Image
              src={page.featuredImage.node.sourceUrl}
              alt={page.featuredImage.node.altText || page.title}
              width={page.featuredImage.node.mediaDetails?.width ?? 1200}
              height={page.featuredImage.node.mediaDetails?.height ?? 675}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        )}

        {/* Контент страницы из WordPress (HTML) */}
        <div
          className="prose prose-lg max-w-none font-gilroy prose-headings:font-gilroy prose-headings:text-unident-dark prose-p:text-gray-700 prose-a:text-unident-primary prose-strong:text-unident-dark prose-ul:text-gray-700"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Дата последнего обновления */}
        <div className="mt-12 border-t border-gray-200 pt-6">
          <p className="font-gilroy text-sm text-gray-500">
            Последнее обновление:{" "}
            {new Date(page.modified).toLocaleDateString("ru-RU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Кнопка "Назад" для вложенных страниц */}
        {isNestedPage && page.parent && (
          <div className="mt-8">
            <Link
              href={
                slug[0] === "blog" && slug[1] === "services"
                  ? "/services"
                  : `/${slug[0]}/`
              }
              className="inline-flex items-center gap-2 font-gilroy text-unident-primary hover:underline"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Назад к разделу &quot;
              {slug[0] === "blog" && slug[1] === "services"
                ? "Услуги"
                : slug[0] === "about"
                  ? "О клинике"
                  : slug[0]}
              &quot;
            </Link>
          </div>
        )}
        </Container>
      </main>
    );
  } catch (error) {
    console.error("[PageComponent] Error fetching page:", error);
    notFound();
  }
}
