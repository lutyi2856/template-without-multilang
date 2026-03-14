/**
 * Динамическая страница акции
 *
 * Роут: /promotions/[slug]
 * Пример: /promotions/implantaciya-50-skidka
 *
 * По образцу doctors/[slug]: заголовок акции в head и на странице.
 * PERFORMANCE: SSG с generateStaticParams, ISR revalidate 3600.
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPromotionBySlug, getAllPromotionsSlugs } from "@/lib/wordpress";
import { Heading, Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

interface PromotionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPromotionsSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("[generateStaticParams] promotions Error:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: PromotionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);

  if (!promotion) {
    return { title: "Акция не найдена - УниДент" };
  }

  return {
    title: `${promotion.title} - Акции - УниДент`,
    description:
      promotion.excerpt ||
      `Акция ${promotion.title} в стоматологической клинике УниДент`,
  };
}

export default async function PromotionPage({ params }: PromotionPageProps) {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);

  if (!promotion) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Акции", href: "/promotions" },
    { label: promotion.title },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Акции", url: `${baseUrl}/promotions` },
    { name: promotion.title, url: `${baseUrl}/promotions/${slug}` },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <BreadcrumbStructuredData items={structuredItems} />
        <Heading level={1} variant="page-title">
          {promotion.title}
        </Heading>
      </div>
    </main>
  );
}

export const revalidate = 3600;
