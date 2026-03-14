/**
 * ReviewsSection - секция «Что о нас говорят пациенты» (отзовики)
 *
 * Данные из Option Page «Главная страница» → вкладка «Секция отзовики».
 * Средний рейтинг и общее количество отзывов считаются из repeater на фронте.
 *
 * PERFORMANCE:
 * - Server Component, fetch через getMainPageSettings()
 * - ISR: revalidate каждый час (как главная)
 */

import { getMainPageSettings } from "@/lib/wordpress/api";
import { Section } from "@/components/design-system";
import { ReviewsSectionClient } from "./reviews-section-client";
import { calculateReviewsSectionStats } from "@/lib/wordpress/utils/reviews-section-calc";

interface ReviewsSectionProps {
  className?: string;
}

export async function ReviewsSection({ className = "" }: ReviewsSectionProps) {
  const mainPageSettings = await getMainPageSettings();

  const title = mainPageSettings?.reviewsSectionTitle?.trim();
  const items = mainPageSettings?.reviewsSectionItems;

  const hasContent = title || (items && items.length > 0);
  if (!hasContent) {
    return null;
  }

  const { averageRating, totalReviews } = calculateReviewsSectionStats(items);

  return (
    <Section
      variant="default"
      spacing="none"
      className={`pt-16 pb-16 ${className}`}
    >
      <ReviewsSectionClient
        title={title ?? undefined}
        content={mainPageSettings?.reviewsSectionContent?.trim() ?? undefined}
        sectionImage={mainPageSettings?.reviewsSectionImage ?? undefined}
        mediumRatingSuffix={mainPageSettings?.reviewsSectionMediumRating?.trim() ?? undefined}
        basis={mainPageSettings?.reviewsSectionBasis?.trim() ?? undefined}
        averageRating={averageRating}
        totalReviews={totalReviews}
        items={items ?? undefined}
      />
    </Section>
  );
}

export const revalidate = 3600;
