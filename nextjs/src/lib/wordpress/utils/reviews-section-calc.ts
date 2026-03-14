import type { MainPageReviewsSectionItem } from "@/types/main-page";

export interface ReviewsSectionCalculated {
  averageRating: number | null;
  totalReviews: number;
}

/**
 * Вычисляет средний рейтинг (взвешенный по количеству отзывов) и общее число отзывов
 * по элементам repeater секции отзовиков.
 */
export function calculateReviewsSectionStats(
  items: MainPageReviewsSectionItem[] | null | undefined
): ReviewsSectionCalculated {
  if (!items?.length) {
    return { averageRating: null, totalReviews: 0 };
  }

  let totalReviews = 0;
  let weightedSum = 0;

  for (const item of items) {
    const count = Number(item.reviewsCount) || 0;
    const rating = Number(item.rating);
    if (count > 0 && !Number.isNaN(rating)) {
      totalReviews += count;
      weightedSum += rating * count;
    }
  }

  const averageRating =
    totalReviews > 0
      ? Math.round((weightedSum / totalReviews) * 10) / 10
      : null;

  return { averageRating, totalReviews };
}
