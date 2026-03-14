/**
 * Динамическая страница клиники
 *
 * Роут: /clinics/[slug]
 * Пример: /clinics/klinika-na-chajkovskogo
 *
 * PERFORMANCE:
 * - Static Site Generation (SSG) с generateStaticParams
 * - ISR: revalidate каждый час
 *
 * TODO: Добавить полный контент страницы (фото, описание, адрес, врачи)
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getClinicBySlug, getAllClinicsSlugs } from "@/lib/wordpress/api";
import { Heading, Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

interface ClinicPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Генерация статических параметров для SSG
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllClinicsSlugs();
    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error("[generateStaticParams] Error:", error);
    return [];
  }
}

/**
 * Генерация метаданных для SEO
 */
export async function generateMetadata({
  params,
}: ClinicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug);

  if (!clinic) {
    return {
      title: "Клиника не найдена - УниДент",
    };
  }

  return {
    title: `${clinic.title} - Клиники - УниДент`,
    description: `Клиника ${clinic.title} в стоматологической сети УниДент`,
  };
}

/**
 * Страница клиники (минимальная версия для проверки роутинга)
 */
export default async function ClinicPage({ params }: ClinicPageProps) {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug);

  if (!clinic) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Клиники", href: "/clinics" },
    { label: clinic.title },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Клиники", url: `${baseUrl}/clinics` },
    { name: clinic.title, url: `${baseUrl}/clinics/${slug}` },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <BreadcrumbStructuredData items={structuredItems} />
        <Heading level={1} variant="page-title">
          {clinic.title}
        </Heading>
      </div>
    </main>
  );
}

export const revalidate = 3600;
