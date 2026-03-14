/**
 * Архив отзывов (CPT: reviews)
 *
 * Страница по макету Figma node 262:3146.
 * Структура: breadcrumbs, заголовок, описание, статистика, блок рейтинга,
 * кнопка «Написать отзыв», фильтры по рейтингу, карточки ReviewCard, Load More.
 */

import { Metadata } from "next";
import {
  getReviews,
  getReviewsFilterOptions,
  getMainPageSettings,
  getReviewsArchiveSettings,
} from "@/lib/wordpress";
import type { ReviewsRatingFilter } from "@/lib/wordpress";
import { ReviewsArchiveSection } from "@/components/sections/reviews-archive-section";
import { BreadcrumbStructuredData } from "@/components/seo";

export const metadata: Metadata = {
  title: "Отзывы - УниДент",
  description: "Отзывы пациентов стоматологической клиники УниДент",
};

export const revalidate = 3600;

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const rawRating = resolved?.rating;
  const rawPlatform = resolved?.platform;
  const ratingFilter: ReviewsRatingFilter | undefined =
    typeof rawRating === "string"
      ? (rawRating.trim() as ReviewsRatingFilter)
      : Array.isArray(rawRating)
        ? (rawRating[0]?.trim() as ReviewsRatingFilter)
        : undefined;
  const validRatingFilter: ReviewsRatingFilter | undefined =
    ratingFilter === "above_49" || ratingFilter === "below_4"
      ? ratingFilter
      : undefined;
  const platformFilter =
    typeof rawPlatform === "string"
      ? rawPlatform.trim()
      : Array.isArray(rawPlatform)
        ? rawPlatform[0]?.trim()
        : undefined;

  const [reviews, filterOptions, mainPageSettings, reviewsArchiveSettings] =
    await Promise.all([
      getReviews({
        first: 1000,
        ratingFilter: validRatingFilter,
        platformSlug: platformFilter || undefined,
      }).catch((error) => {
        console.error("[ReviewsPage] Error fetching reviews:", error);
        return [];
      }),
      getReviewsFilterOptions(),
      getMainPageSettings(),
      getReviewsArchiveSettings(),
    ]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unident.ru";
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Отзывы" },
  ];
  const structuredItems = [
    { name: "Главная", url: baseUrl + "/" },
    { name: "Отзывы", url: baseUrl + "/reviews" },
  ];

  return (
    <main id="main-content">
      <BreadcrumbStructuredData items={structuredItems} />
      <ReviewsArchiveSection
        reviews={reviews}
        mainPageSettings={mainPageSettings}
        reviewsArchiveSettings={reviewsArchiveSettings}
        breadcrumbItems={breadcrumbItems}
        ratingFilter={validRatingFilter}
        platformFilter={platformFilter || undefined}
        platforms={filterOptions.platforms}
        reviewsCount={reviews.length}
      />
    </main>
  );
}
