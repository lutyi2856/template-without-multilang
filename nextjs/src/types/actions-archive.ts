/**
 * TypeScript types для Actions Archive Settings Option Page
 *
 * Страница /promotions — описание, преимущества, CTA блок (без PDF и акций)
 */

export interface ActionsArchiveAdvantageImage {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

export interface ActionsArchiveAdvantage {
  headline?: string | null;
  image?: ActionsArchiveAdvantageImage | null;
}

export interface ActionsArchiveCtaImage {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

export interface ActionsArchiveSettings {
  actionPageDescription?: string | null;
  advantages?: ActionsArchiveAdvantage[] | null;
  ctaTitle?: string | null;
  ctaDescription?: string | null;
  ctaPhone?: string | null;
  ctaPrivacyText?: string | null;
  ctaPrivacyLink?: string | null;
  ctaDoctorImage?: ActionsArchiveCtaImage | null;
}
