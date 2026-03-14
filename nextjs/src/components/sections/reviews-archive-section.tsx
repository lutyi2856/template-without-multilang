/**
 * ReviewsArchiveSection — секция архива отзывов
 *
 * Обёртка для страницы /reviews по макету Figma (node 262:3146).
 * Структура: breadcrumbs, заголовок, описание, статистика, блок рейтинга,
 * кнопка «Написать отзыв», placeholder фильтра, карточки ReviewCard, Load More.
 */

import Link from "next/link";
import {
  Container,
  Text,
  Breadcrumbs,
  Button,
  Section,
  Heading,
} from "@/components/design-system";
import { ReviewsSectionClient } from "./reviews-section-client";
import { ReviewsArchiveClient } from "./reviews-archive-client";
import { ReviewsArchiveCtaSection } from "./reviews-archive-cta-section";
import { ReviewsFilters } from "./reviews-filters";
import { ReviewsScrollRestore } from "./reviews-scroll-restore";
import { calculateReviewsSectionStats } from "@/lib/wordpress/utils/reviews-section-calc";
import { getReviewWord } from "@/lib/wordpress/utils/review-plural";
import type { Review } from "@/lib/wordpress/types/review";
import type { MainPageSettings } from "@/types/main-page";
import type { ReviewsArchiveSettings } from "@/types/reviews-archive";
import type { ReviewPlatform } from "@/lib/wordpress";
import type { ReviewsRatingFilter } from "@/lib/wordpress";

interface ReviewsArchiveSectionProps {
  reviews: Review[];
  mainPageSettings: MainPageSettings | null;
  reviewsArchiveSettings: ReviewsArchiveSettings | null;
  breadcrumbItems: Array<{ label: string; href?: string }>;
  ratingFilter?: ReviewsRatingFilter;
  platformFilter?: string;
  platforms: ReviewPlatform[];
  reviewsCount: number;
}

/** Статистика за квартал: good = rating >= 4, bad = rating < 4 */
function calculateQuarterStats(reviews: Review[]): {
  total: number;
  good: number;
  bad: number;
} {
  const now = new Date();
  const quarterStart = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1
  );
  const quarterReviews = reviews.filter((r) => new Date(r.date) >= quarterStart);
  let good = 0;
  let bad = 0;
  for (const r of quarterReviews) {
    const rating = r.rating != null ? Number(r.rating) : null;
    if (rating != null) {
      if (rating >= 4) good++;
      else bad++;
    } else {
      good++;
    }
  }
  return { total: quarterReviews.length, good, bad };
}

export function ReviewsArchiveSection({
  reviews,
  mainPageSettings,
  reviewsArchiveSettings,
  breadcrumbItems,
  ratingFilter,
  platformFilter,
  platforms,
  reviewsCount,
}: ReviewsArchiveSectionProps) {
  const items = mainPageSettings?.reviewsSectionItems;
  const hasActiveFilters = Boolean(ratingFilter) || Boolean(platformFilter);
  const { averageRating, totalReviews } = calculateReviewsSectionStats(items);
  const quarterStats = calculateQuarterStats(reviews);

  return (
    <div className="min-h-screen bg-white">
      <Container size="xl" className="pt-16 pb-[30px]">
        <Breadcrumbs items={breadcrumbItems} />
      </Container>

      {/* Блок заголовка и описания. Figma 405:3700 — «Отзывы», gap 30px (262:3149→405:3700) */}
      <Section
        variant="default"
        spacing="none"
        className="pb-16"
      >
        <ReviewsSectionClient
          title="Отзывы"
          content="В нашей стоматологии оказывается высококачественные услуги любого уровня сложности, мы благодарны нашим пациентам за оказанное доверие и положительные отзывы."
          headingLevel={1}
          sectionImage={mainPageSettings?.reviewsSectionImage ?? undefined}
          mediumRatingSuffix={mainPageSettings?.reviewsSectionMediumRating?.trim() ?? "/5.0"}
          basis={mainPageSettings?.reviewsSectionBasis?.trim() ?? undefined}
          averageRating={averageRating}
          totalReviews={totalReviews}
          items={items ?? undefined}
        />
      </Section>

      <Container size="xl" className="pb-16">
        {/* Заголовок и кнопка (Figma 440:4236, 440:4246). Статистика квартала динамическая */}
        <div className="flex flex-col max-lg:items-center lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <Link
            href="/#cta"
            className="w-full max-lg:w-1/2 max-lg:mx-auto lg:w-auto lg:shrink-0 lg:order-2"
          >
            <Button
              unidentVariant="outline"
              className="w-full max-lg:w-full lg:w-[172px] min-h-[44px] py-4 rounded-[15px] font-gilroy text-base font-semibold tracking-[-0.01em] border-2"
            >
              Написать отзыв
            </Button>
          </Link>
          <Heading
            level={2}
            variant="reviews-stats-heading"
            className="text-unident-dark w-full max-md:w-full md:w-1/2 md:text-center lg:w-auto lg:max-w-[789px] lg:text-left lg:order-1"
          >
            <span className="block">
              За квартал мы получили {quarterStats.total}{" "}
              {getReviewWord(quarterStats.total)}.
            </span>
            <span className="block">
              Из них {quarterStats.good} хороших и {quarterStats.bad} не очень
            </span>
          </Heading>
        </div>

        {/* Восстановление скролла после смены фильтра */}
        <ReviewsScrollRestore
          filterKey={`${ratingFilter ?? ""}-${platformFilter ?? ""}`}
        />

        {/* Фильтр по рейтингу и платформе (Figma 440:4237) */}
        <ReviewsFilters
          platforms={platforms}
          reviewsCount={reviewsCount}
        />

        {/* Карточки отзывов + Load More. Figma 262:3916 — одна колонка, gap 25px, фон белый */}
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Text variant="large" className="text-unident-textGray mb-4" as="p">
                {hasActiveFilters
                  ? "По выбранным фильтрам отзывы не найдены"
                  : "Пока нет опубликованных отзывов."}
              </Text>
              <Text variant="small" className="text-unident-textGray" as="p">
                {hasActiveFilters
                  ? "Попробуйте изменить рейтинг или платформу"
                  : "Отзывы подтягиваются из записей типа «Отзыв» в WordPress."}
              </Text>
            </div>
          ) : (
            <ReviewsArchiveClient
              reviews={reviews}
              clinicLogoUrl={reviewsArchiveSettings?.clinicLogoReviewCard?.url ?? undefined}
              clinicAvatarBackgroundColor={
                reviewsArchiveSettings?.clinicLogoReviewCardBackgroundColor ?? undefined
              }
              initialVisible={5}
              loadMoreStep={10}
            />
          )}
        </div>
      </Container>

      {/* CTA блок «Оставьте отзыв» — в самом низу страницы. Figma 440:4263 */}
      <ReviewsArchiveCtaSection />
    </div>
  );
}
