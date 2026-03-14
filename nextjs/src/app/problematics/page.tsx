/**
 * Архив таксономии «Проблематика» (problematics)
 *
 * Роут: /problematics
 * Список всех проблематик со ссылками на страницы терминов.
 */

import { Metadata } from "next";
import Link from "next/link";
import { getAllProblematics } from "@/lib/wordpress";
import {
  Container,
  Heading,
  Text,
  Breadcrumbs,
} from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = {
  title: "Проблематика - УниДент",
  description:
    "Проблематика стоматологических услуг: вылечить зубы, исправить прикус, поставить импланты и другие",
};

export const revalidate = 3600;

export default async function ProblematicsArchivePage() {
  let problematics: Awaited<ReturnType<typeof getAllProblematics>> = [];

  try {
    problematics = await getAllProblematics();
  } catch (error) {
    console.error("[ProblematicsArchivePage] Error:", error);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Проблематика" },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Проблематика", url: `${baseUrl}/problematics` },
  ];

  return (
    <main id="main-content">
      <Container size="xl" className="py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <BreadcrumbStructuredData items={structuredItems} />
        <div className="mb-12">
          <Heading level={1} variant="page-title" className="text-unident-dark">
            Проблематика
          </Heading>
          <Text variant="large" className="text-unident-textGray max-w-3xl mt-4">
            Выберите проблематику: вылечить зубы, исправить прикус, поставить
            импланты и другие стоматологические задачи.
          </Text>
        </div>

        {!problematics?.length ? (
          <div className="text-center py-12">
            <Text variant="large" className="text-unident-textGray">
              Проблематики не найдены.
            </Text>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {problematics.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/problematics/${item.slug}`}
                  className="block p-4 rounded-[15px] border-2 border-unident-borderGray hover:border-unident-primary hover:bg-unident-bgElements transition-colors"
                >
                  <Text
                    variant="card-title"
                    as="span"
                    className="text-unident-dark font-semibold"
                  >
                    {item.name}
                  </Text>
                  {item.count != null && (
                    <Text
                      variant="small"
                      as="span"
                      className="block mt-1 text-unident-textGray"
                    >
                      Услуг: {item.count}
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
