/**
 * TypeScript types для Our Works Archive Settings Option Page
 *
 * Страница /our-works — описание, преимущества, CTA блок (идентично архиву акций)
 */

export interface OurWorksArchiveAdvantageImage {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

export interface OurWorksArchiveAdvantage {
  headline?: string | null;
  image?: OurWorksArchiveAdvantageImage | null;
}

export interface OurWorksArchiveCtaImage {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

export interface OurWorksArchiveSettings {
  actionPageDescription?: string | null;
  advantages?: OurWorksArchiveAdvantage[] | null;
  ctaTitle?: string | null;
  ctaDescription?: string | null;
  ctaPhone?: string | null;
  ctaPrivacyText?: string | null;
  ctaPrivacyLink?: string | null;
  ctaDoctorImage?: OurWorksArchiveCtaImage | null;
}
