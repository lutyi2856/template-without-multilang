/**
 * Страница термина таксономии «Проблематика»
 *
 * Роут: /problematics/[slug]
 * Заголовок и описание термина.
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  getProblematicBySlug,
  getAllProblematicsSlugs,
} from "@/lib/wordpress";
import {
  Container,
  Heading,
  Text,
  Breadcrumbs,
} from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";

interface ProblematicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllProblematicsSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProblematicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const problematic = await getProblematicBySlug(slug);
  if (!problematic) {
    return { title: "Проблематика не найдена - УниДент" };
  }
  return {
    title: `${problematic.name} - Проблематика - УниДент`,
    description:
      problematic.description ||
      `Услуги по проблематике «${problematic.name}» в стоматологической клинике УниДент`,
  };
}

export default async function ProblematicPage({
  params,
}: ProblematicPageProps) {
  const { slug } = await params;
  const problematic = await getProblematicBySlug(slug);

  if (!problematic) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Проблематика", href: "/problematics" },
    { label: problematic.name },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Проблематика", url: `${baseUrl}/problematics` },
    {
      name: problematic.name,
      url: `${baseUrl}/problematics/${slug}`,
    },
  ];

  const relatedCategories = problematic.relatedServiceCategories?.nodes ?? [];

  return (
    <main id="main-content">
      <Container size="xl" className="py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <BreadcrumbStructuredData items={structuredItems} />
        <Heading level={1} variant="page-title" className="text-unident-dark">
          {problematic.name}
        </Heading>
        {problematic.description && (
          <Text
            variant="large"
            as="div"
            className="text-unident-textGray mt-4 max-w-3xl [&_p]:mb-2 last:[&_p]:mb-0"
            dangerouslySetInnerHTML={{ __html: problematic.description }}
          />
        )}
        {relatedCategories.length > 0 && (
          <div className="mt-12">
            <Heading level={2} variant="subsection" className="mb-4">
              Связанные категории услуг
            </Heading>
            <ul className="flex flex-wrap gap-2">
              {relatedCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/service-category/${cat.slug}`}
                    className="inline-block px-4 py-2 rounded-[10px] bg-unident-bgElements hover:bg-unident-bgLightBlue text-unident-dark font-medium transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </main>
  );
}

export const revalidate = 3600;
