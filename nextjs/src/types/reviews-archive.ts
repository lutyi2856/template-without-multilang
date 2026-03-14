/**
 * TypeScript types для Reviews Archive Settings Option Page
 *
 * CTA блок страницы /reviews (Figma 440:4263)
 */

export interface ReviewsArchiveCtaImage {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

export interface ReviewsArchiveSettings {
  ctaTitle?: string | null;
  ctaDescription?: string | null;
  ctaButtonText?: string | null;
  ctaBackground?: ReviewsArchiveCtaImage | null;
  ctaIcon?: ReviewsArchiveCtaImage | null;
  ctaContentImage?: ReviewsArchiveCtaImage | null;
  ctaGiftImage?: ReviewsArchiveCtaImage | null;
  clinicLogoReviewCard?: ReviewsArchiveCtaImage | null;
  clinicLogoReviewCardBackgroundColor?: string | null;
}
