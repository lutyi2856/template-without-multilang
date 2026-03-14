/**
 * TypeScript types для Price Archive Settings Option Page
 *
 * Страница /prices — описание, преимущества, акции, PDF, CTA блок
 */

export interface PriceArchiveAdvantageImage {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

export interface PriceArchiveAdvantage {
  headline?: string | null;
  image?: PriceArchiveAdvantageImage | null;
}

export interface PriceArchiveCtaImage {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

export interface PriceArchivePdf {
  url?: string | null;
  id?: string | null;
}

export interface PriceArchiveSettings {
  showAverageInCity?: boolean | null;
  pricePageDescription?: string | null;
  advantages?: PriceArchiveAdvantage[] | null;
  selectedPromotions?: { id: string; databaseId?: number }[] | null;
  priceListPdf?: PriceArchivePdf | null;
  ctaTitle?: string | null;
  ctaDescription?: string | null;
  ctaPhone?: string | null;
  ctaPrivacyText?: string | null;
  ctaPrivacyLink?: string | null;
  ctaDoctorImage?: PriceArchiveCtaImage | null;
}
