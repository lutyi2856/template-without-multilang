/**
 * Страница термина таксономии «Категории услуг»
 *
 * Роут: /service-category/[slug]
 * Пока только заголовок (название термина).
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getServiceCategoryBySlug,
  getAllServiceCategoriesSlugs,
} from "@/lib/wordpress";
import { Container, Heading, Breadcrumbs } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

interface ServiceCategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllServiceCategoriesSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ServiceCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getServiceCategoryBySlug(slug);
  if (!category) {
    return { title: "Категория не найдена - УниДент" };
  }
  return {
    title: `${category.name} - Категории услуг - УниДент`,
    description:
      category.description ||
      `Услуги категории «${category.name}» в стоматологической клинике УниДент`,
  };
}

export default async function ServiceCategoryPage({
  params,
}: ServiceCategoryPageProps) {
  const { slug } = await params;
  const category = await getServiceCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Категории услуг", href: "/service-category" },
    { label: category.name },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Категории услуг", url: `${baseUrl}/service-category` },
    {
      name: category.name,
      url: `${baseUrl}/service-category/${slug}`,
    },
  ];

  return (
    <main id="main-content">
      <Container size="xl" className="py-16">
      <Breadcrumbs items={breadcrumbItems} />
      <BreadcrumbStructuredData items={structuredItems} />
      <Heading level={1} variant="page-title" className="text-unident-dark">
        {category.name}
      </Heading>
      </Container>
    </main>
  );
}

export const revalidate = 3600;
