/**
 * Архив таксономии «Категории услуг» (service_categories)
 *
 * Роут: /service-category
 * Список всех категорий услуг со ссылками на страницы терминов.
 */

import { Metadata } from "next";
import Link from "next/link";
import { getAllServiceCategories } from "@/lib/wordpress";
import {
  Container,
  Heading,
  Text,
  Breadcrumbs,
} from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = {
  title: "Категории услуг - УниДент",
  description:
    "Категории стоматологических услуг: имплантация, терапия, хирургия, ортодонтия и другие",
};

export const revalidate = 3600;

export default async function ServiceCategoryArchivePage() {
  let categories: Awaited<ReturnType<typeof getAllServiceCategories>> = [];

  try {
    categories = await getAllServiceCategories();
  } catch (error) {
    console.error("[ServiceCategoryArchivePage] Error:", error);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Категории услуг" },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Категории услуг", url: `${baseUrl}/service-category` },
  ];

  return (
    <main id="main-content">
      <Container size="xl" className="py-16">
      <Breadcrumbs items={breadcrumbItems} />
      <BreadcrumbStructuredData items={structuredItems} />
      <div className="mb-12">
        <Heading level={1} variant="page-title" className="text-unident-dark">
          Категории услуг
        </Heading>
        <Text variant="large" className="text-unident-textGray max-w-3xl mt-4">
          Выберите категорию стоматологических услуг: имплантация, лечение
          зубов, протезирование, ортодонтия и другие.
        </Text>
      </div>

      {!categories?.length ? (
        <div className="text-center py-12">
          <Text variant="large" className="text-unident-textGray">
            Категории не найдены.
          </Text>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/service-category/${cat.slug}`}
                className="block p-4 rounded-[15px] border-2 border-unident-borderGray hover:border-unident-primary hover:bg-unident-bgElements transition-colors"
              >
                <Text
                  variant="card-title"
                  as="span"
                  className="text-unident-dark font-semibold"
                >
                  {cat.name}
                </Text>
                {cat.count != null && (
                  <Text
                    variant="small"
                    as="span"
                    className="block mt-1 text-unident-textGray"
                  >
                    Услуг: {cat.count}
                  </Text>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      </Container>
    </main>
  );
}
