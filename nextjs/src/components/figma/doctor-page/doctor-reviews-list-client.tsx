"use client";

import React, { useState } from "react";
import { DoctorReviewCard } from "./doctor-review-card";
import { Button, Text } from "@/components/design-system";
import type { Review } from "@/lib/wordpress/types/review";

interface DoctorReviewsListClientProps {
  reviews: Review[];
  clinicLogoUrl?: string;
  clinicAvatarBackgroundColor?: string;
}

const INITIAL_VISIBLE = 2;
const LOAD_MORE_COUNT = 2;

/**
 * Список отзывов о враче с Load more.
 * Max 2 видны изначально, по 2 подгружаем.
 */
export function DoctorReviewsListClient({
  reviews,
  clinicLogoUrl,
  clinicAvatarBackgroundColor,
}: DoctorReviewsListClientProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;
  const remainingCount = reviews.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + LOAD_MORE_COUNT, reviews.length)
    );
  };

  if (!reviews?.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5">
        {visibleReviews.map((review) => (
          <DoctorReviewCard
            key={review.id}
            review={review}
            clinicAvatarUrl={clinicLogoUrl}
            clinicAvatarBackgroundColor={clinicAvatarBackgroundColor}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-2 flex justify-center">
          <Button
            unidentVariant="outline"
            onClick={handleLoadMore}
            className="min-w-[200px] inline-flex items-center justify-center gap-2"
            aria-label={`Загрузить ещё ${Math.min(remainingCount, LOAD_MORE_COUNT)} отзывов`}
          >
            <Text variant="button-text" as="span">
              Загрузить ещё
            </Text>
          </Button>
        </div>
      )}
    </div>
  );
}
