/**
 * Архивная страница цен - /prices
 *
 * Порядок: Breadcrumbs, H1, описание, карточки преимуществ, секция цен с навигацией,
 * кнопка PDF, блок акций, CTA.
 *
 * PERFORMANCE:
 * - Server Component
 * - ISR: revalidate каждый час
 * - Fetch данных на сервере с кэшированием
 */

import { Metadata } from "next";
import { Heading, Breadcrumbs, Text } from "@/components/design-system";
import { BreadcrumbStructuredData } from "@/components/seo";
import { PriceArchiveAdvantages } from "@/components/figma/price/price-archive-advantages";
import { PriceSectionWithNav } from "@/components/figma/price/price-section-with-nav";
import { CtaSection } from "@/components/sections/cta-section";
import { PromotionsSectionForPrices } from "@/components/sections/promotions-section-for-prices";
import {
  getPricesByCategoriesForArchive,
  getPricesByCategories,
  getPriceArchiveSettings,
  getPromotionsForPriceArchive,
  getMainPageSettings,
} from "@/lib/wordpress/api";

export const metadata: Metadata = {
  title: "Цены на услуги - УниДент",
  description:
    "Прайс-лист стоматологических услуг клиники УниДент с ценами по категориям",
};

// ISR: Revalidate каждый час
export const revalidate = 3600;

export default async function PricesPage() {
  const [archiveData, priceArchiveSettings, mainPageSettings] =
    await Promise.all([
      getPricesByCategoriesForArchive(),
      getPriceArchiveSettings(),
      getMainPageSettings(),
    ]);

  const categoriesWithPrices =
    archiveData && archiveData.length > 0
      ? archiveData
      : await getPricesByCategories();

  const promotions = await getPromotionsForPriceArchive(
    priceArchiveSettings?.selectedPromotions?.map((p) => p.id) ?? null
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [{ label: "Главная", href: "/" }, { label: "Цены" }];
  const structuredItems = [
    { name: "Главная", url: baseUrl + "/" },
    { name: "Цены", url: baseUrl + "/prices" },
  ];

  if (!categoriesWithPrices || categoriesWithPrices.length === 0) {
    return (
      <main id="main-content" className="container mx-auto px-4 py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <BreadcrumbStructuredData items={structuredItems} />
        <Heading
          level={1}
          variant="page-title"
          className="mb-4 text-unident-dark"
        >
          Цены
        </Heading>
        <Text variant="large" className="text-unident-textGray">
          Информация о ценах временно недоступна. Пожалуйста, свяжитесь с нами
          для уточнения стоимости услуг.
        </Text>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-white py-16">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-16">
        <Breadcrumbs items={breadcrumbItems} />
        <BreadcrumbStructuredData items={structuredItems} />

        <Heading
          level={1}
          className="mb-4 text-unident-dark text-[48px] font-bold leading-tight tracking-[-0.03em]"
        >
          Цены
        </Heading>

        {priceArchiveSettings?.pricePageDescription && (
          <Text
            variant="large"
            className="mb-12 text-unident-dark max-w-3xl"
          >
            {priceArchiveSettings.pricePageDescription}
          </Text>
        )}

        <PriceArchiveAdvantages
          advantages={priceArchiveSettings?.advantages}
          className="mb-12"
        />

        <PriceSectionWithNav
          categories={categoriesWithPrices}
          priceListPdfUrl={priceArchiveSettings?.priceListPdf?.url ?? null}
          showAverageInCity={priceArchiveSettings?.showAverageInCity ?? true}
        />
      </div>

      <PromotionsSectionForPrices
        promotions={promotions}
        title={mainPageSettings?.promotionsSectionTitle}
        description={mainPageSettings?.promotionsSectionDescription}
        fallbackImage={mainPageSettings?.promotionsFallbackImage}
      />

      <CtaSection
        imageLayout="option2"
        ctaData={
          priceArchiveSettings
            ? {
                ctaTitle: priceArchiveSettings.ctaTitle ?? undefined,
                ctaDescription: priceArchiveSettings.ctaDescription ?? undefined,
                ctaPhone: priceArchiveSettings.ctaPhone ?? undefined,
                ctaPrivacyText: priceArchiveSettings.ctaPrivacyText ?? undefined,
                ctaPrivacyLink: priceArchiveSettings.ctaPrivacyLink ?? undefined,
                ctaDoctorImage: priceArchiveSettings.ctaDoctorImage
                  ? {
                      url: priceArchiveSettings.ctaDoctorImage.url ?? undefined,
                      width: priceArchiveSettings.ctaDoctorImage.width ?? undefined,
                      height: priceArchiveSettings.ctaDoctorImage.height ?? undefined,
                      alt: priceArchiveSettings.ctaDoctorImage.alt ?? undefined,
                    }
                  : null,
              }
            : null
        }
      />
    </main>
  );
}
