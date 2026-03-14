'use client';

import { useState } from 'react';
import { ReviewCard } from '@/components/figma/review-card';
import { Button } from '@/components/design-system';
import type { Review } from '@/lib/wordpress/types/review';

const INITIAL_VISIBLE = 5;
const LOAD_MORE_STEP = 10;

interface ReviewsArchiveClientProps {
  reviews: Review[];
  clinicLogoUrl?: string;
  clinicAvatarBackgroundColor?: string;
  initialVisible?: number;
  loadMoreStep?: number;
}

/**
 * ReviewsArchiveClient — клиентский компонент архива отзывов
 *
 * Отображает карточки ReviewCard с Load More.
 * По умолчанию показывается 5 отзывов, по клику «Показать больше» добавляется +10.
 *
 * Figma node 262:3916 (cards), 404:3150 (Load More button)
 */
export function ReviewsArchiveClient({
  reviews,
  clinicLogoUrl,
  clinicAvatarBackgroundColor,
  initialVisible = INITIAL_VISIBLE,
  loadMoreStep = LOAD_MORE_STEP,
}: ReviewsArchiveClientProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + loadMoreStep, reviews.length));
  };

  if (!reviews.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-[25px]">
        {visibleReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            clinicAvatarUrl={clinicLogoUrl}
            clinicAvatarBackgroundColor={clinicAvatarBackgroundColor}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            unidentVariant="outline"
            onClick={handleLoadMore}
            className="min-w-[250px] min-h-[44px] py-4 px-6 border-2 border-unident-primary text-unident-primary rounded-[15px] font-semibold text-base leading-[1.193] tracking-[-0.01em] hover:bg-unident-primary hover:text-white transition-colors"
          >
            Показать больше
          </Button>
        </div>
      )}
    </div>
  );
}
