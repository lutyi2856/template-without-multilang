/**
 * FeaturedReviewsSection - секция с постами отзывов (CPT: reviews)
 *
 * Показывает последние отзывы пациентов из WordPress (тип записи Review).
 * Не путать с ReviewsSection («отзовики») — блок рейтингов с агрегаторов (Яндекс, 2GIS).
 *
 * - Данные: getFeaturedReviews() → GraphQL reviews(first, orderby DATE)
 * - Слайдер карточек ReviewCard, кнопка «Все отзывы» → /reviews
 *
 * PERFORMANCE: Server Component, ISR revalidate 1h
 */

import { getFeaturedReviews, getReviewsArchiveSettings } from "@/lib/wordpress";
import { Section } from "@/components/design-system";
import { FeaturedReviewsSectionClient } from "./featured-reviews-section-client";

interface FeaturedReviewsSectionProps {
  className?: string;
}

export async function FeaturedReviewsSection({
  className = "",
}: FeaturedReviewsSectionProps) {
  let reviews: Awaited<ReturnType<typeof getFeaturedReviews>> = [];
  let clinicLogoUrl: string | undefined;
  let clinicAvatarBackgroundColor: string | undefined;
  try {
    const [reviewsData, archiveSettings] = await Promise.all([
      getFeaturedReviews(20),
      getReviewsArchiveSettings(),
    ]);
    reviews = reviewsData;
    clinicLogoUrl = archiveSettings?.clinicLogoReviewCard?.url ?? undefined;
    clinicAvatarBackgroundColor =
      archiveSettings?.clinicLogoReviewCardBackgroundColor ?? undefined;
  } catch (error) {
    console.error("[FeaturedReviewsSection] Error fetching reviews:", error);
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <Section
      id="reviews"
      variant="default"
      spacing="none"
      className={`pt-16 pb-16 ${className}`}
    >
      <FeaturedReviewsSectionClient
        reviews={reviews}
        clinicLogoUrl={clinicLogoUrl}
        clinicAvatarBackgroundColor={clinicAvatarBackgroundColor}
      />
    </Section>
  );
}

export const revalidate = 3600;
