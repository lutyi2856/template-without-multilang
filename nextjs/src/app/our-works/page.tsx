/**
 * Our Works Page - Архив всех работ
 *
 * Показывает все работы (CPT our-works) в виде сетки карточек.
 * Фильтрация по категориям (service_categories). Load More с cursor-based пагинацией.
 * Описание, преимущества, CTA блок из Option Page «Архив наших работ».
 *
 * PERFORMANCE:
 * - Server Component для data fetching
 * - force-dynamic для корректной работы фильтров
 */

import { Metadata } from "next";
import {
  getOurWorksArchiveSettings,
  getOurWorksConnection,
  getOurWorksFilterOptions,
} from "@/lib/wordpress";
import {
  Container,
  Heading,
  Text,
  Breadcrumbs,
} from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import { PriceArchiveAdvantages } from "@/components/figma/price/price-archive-advantages";
import { CtaSection } from "@/components/sections/cta-section";
import { OurWorksArchiveSectionClient } from "@/components/sections/our-works-archive-section-client";

export const metadata: Metadata = {
  title: "Наши кейсы - УниДент",
  description:
    "Архив работ стоматологической клиники УниДент. Примеры работ по имплантации, протезированию, отбеливанию и другим стоматологическим услугам.",
};

export const dynamic = "force-dynamic";

const DEFAULT_DESCRIPTION =
  "Примеры наших работ по имплантации, протезированию, отбеливанию и другим стоматологическим услугам. Все работы выполнены нашими опытными врачами.";

const PAGE_TITLE = "Наши кейсы";

export default async function OurWorksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const rawCategory = resolved?.category;
  const categorySlug =
    typeof rawCategory === "string"
      ? rawCategory.trim()
      : Array.isArray(rawCategory)
        ? rawCategory[0]?.trim()
        : undefined;
  const filters = {
    categorySlug:
      categorySlug && categorySlug.length > 0 ? categorySlug : undefined,
  };

  const [ourWorksArchiveSettings, worksResult, filterOptions] =
    await Promise.all([
      getOurWorksArchiveSettings(),
      getOurWorksConnection(4, undefined, filters),
      getOurWorksFilterOptions(),
    ]);

  const { works, pageInfo } = worksResult;
  const { categories } = filterOptions;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Кейсы" },
  ];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Кейсы", url: `${baseUrl}/our-works` },
  ];

  const pageDescription =
    ourWorksArchiveSettings?.actionPageDescription ?? DEFAULT_DESCRIPTION;

  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Container size="xl" className="py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <BreadcrumbStructuredData items={structuredItems} />

        {/* Заголовок и описание */}
        <div className="mb-12">
          <Heading level={1} variant="page-hero-title" className="text-unident-dark mb-4">
            {PAGE_TITLE}
          </Heading>
          <Text variant="large" className="text-unident-textGray max-w-3xl">
            {pageDescription}
          </Text>
        </div>

        {/* Преимущества */}
        <PriceArchiveAdvantages
          advantages={ourWorksArchiveSettings?.advantages}
          className="mb-12"
        />

        {/* Фильтры + сетка карточек работ */}
        <OurWorksArchiveSectionClient
          initialWorks={works}
          initialPageInfo={pageInfo}
          initialFilters={filters}
          categories={categories}
        />
      </Container>

      {/* CTA блок */}
      <CtaSection
        imageLayout="option2"
        ctaData={
          ourWorksArchiveSettings
            ? {
                ctaTitle: ourWorksArchiveSettings.ctaTitle ?? undefined,
                ctaDescription:
                  ourWorksArchiveSettings.ctaDescription ?? undefined,
                ctaPhone: ourWorksArchiveSettings.ctaPhone ?? undefined,
                ctaPrivacyText:
                  ourWorksArchiveSettings.ctaPrivacyText ?? undefined,
                ctaPrivacyLink:
                  ourWorksArchiveSettings.ctaPrivacyLink ?? undefined,
                ctaDoctorImage: ourWorksArchiveSettings.ctaDoctorImage
                  ? {
                      url: ourWorksArchiveSettings.ctaDoctorImage.url ?? undefined,
                      width:
                        ourWorksArchiveSettings.ctaDoctorImage.width ?? undefined,
                      height:
                        ourWorksArchiveSettings.ctaDoctorImage.height ??
                        undefined,
                      alt: ourWorksArchiveSettings.ctaDoctorImage.alt ?? undefined,
                    }
                  : null,
              }
            : null
        }
      />
    </main>
  );
}
