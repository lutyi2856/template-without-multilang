/**
 * Promotions Page - Архив всех акций
 *
 * Верхний блок (как на странице цен): breadcrumbs, H1, описание, преимущества.
 * Фильтрация по категориям (service_categories). Load More с cursor-based пагинацией.
 * CTA из Option Page «Архив акций».
 *
 * PERFORMANCE:
 * - Server Component для data fetching
 * - force-dynamic для корректной работы фильтров
 */

import { Metadata } from "next";
import {
  getActionsArchiveSettings,
  getPromotionsConnection,
  getPromotionFilterOptions,
  getMainPageSettings,
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
import { PromotionsArchiveSectionClient } from "@/components/sections/promotions-archive-section-client";

export const metadata: Metadata = {
  title: "Акции - УниДент",
  description: "Актуальные акции и специальные предложения клиники УниДент",
};

export const dynamic = "force-dynamic";

const DEFAULT_DESCRIPTION =
  "Актуальные акции клиники УниДент. Скидки на имплантацию, профессиональную гигиену, отбеливание и другие стоматологические услуги.";

const PAGE_TITLE = "Акции и специальные предложения";

export default async function PromotionsPage({
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

  const [actionsArchiveSettings, promotionsResult, filterOptions, mainPageSettings] =
    await Promise.all([
      getActionsArchiveSettings(),
      getPromotionsConnection(12, undefined, filters),
      getPromotionFilterOptions(),
      getMainPageSettings(),
    ]);

  const { promotions, pageInfo } = promotionsResult;
  const { categories } = filterOptions;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [{ label: "Главная", href: "/" }, { label: "Акции" }];
  const structuredItems = [
    { name: "Главная", url: `${baseUrl}/` },
    { name: "Акции", url: `${baseUrl}/promotions` },
  ];

  const pageDescription =
    actionsArchiveSettings?.actionPageDescription ?? DEFAULT_DESCRIPTION;

  const filteredCategories = categories.filter(
    (c) => (c.slug?.trim() ?? "") !== "" && (c.name?.trim() ?? "") !== ""
  );

  return (
    <main id="main-content" className="min-h-screen bg-white">
      <Container size="xl" className="py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <BreadcrumbStructuredData items={structuredItems} />

        {/* Заголовок и описание — как на странице цен */}
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
          advantages={actionsArchiveSettings?.advantages}
          className="mb-12"
        />

        {/* Фильтры + архив акций */}
        <PromotionsArchiveSectionClient
          initialPromotions={promotions}
          initialPageInfo={pageInfo}
          initialFilters={filters}
          categories={filteredCategories}
          fallbackImage={mainPageSettings?.promotionsFallbackImage ?? null}
        />
      </Container>

      {/* CTA блок */}
      <CtaSection
        imageLayout="option2"
        ctaData={
          actionsArchiveSettings
            ? {
                ctaTitle: actionsArchiveSettings.ctaTitle ?? undefined,
                ctaDescription: actionsArchiveSettings.ctaDescription ?? undefined,
                ctaPhone: actionsArchiveSettings.ctaPhone ?? undefined,
                ctaPrivacyText: actionsArchiveSettings.ctaPrivacyText ?? undefined,
                ctaPrivacyLink: actionsArchiveSettings.ctaPrivacyLink ?? undefined,
                ctaDoctorImage: actionsArchiveSettings.ctaDoctorImage
                  ? {
                      url: actionsArchiveSettings.ctaDoctorImage.url ?? undefined,
                      width: actionsArchiveSettings.ctaDoctorImage.width ?? undefined,
                      height: actionsArchiveSettings.ctaDoctorImage.height ?? undefined,
                      alt: actionsArchiveSettings.ctaDoctorImage.alt ?? undefined,
                    }
                  : null,
              }
            : null
        }
      />
    </main>
  );
}
