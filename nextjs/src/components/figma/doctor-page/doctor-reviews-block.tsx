/**
 * DoctorReviewsBlock — секция «Отзывы о враче»
 *
 * Figma node 404:2587. Layout: platform reviews (max 4, compact) + patient reviews (max 2 + Load more).
 * Сейчас используем только relatedReviews (отзывы пациентов).
 *
 * PERFORMANCE: Server Component.
 */

import { Heading } from "@/components/design-system";
import { DoctorReviewsListClient } from "./doctor-reviews-list-client";
import type { Review } from "@/lib/wordpress/types/review";

interface DoctorReviewsBlockProps {
  /** Отзывы пациентов о враче */
  relatedReviews?: Review[] | null;
  /** URL логотипа клиники для блока ответа */
  clinicLogoUrl?: string;
  /** Цвет фона контейнера логотипа клиники */
  clinicAvatarBackgroundColor?: string;
}

export function DoctorReviewsBlock({
  relatedReviews,
  clinicLogoUrl,
  clinicAvatarBackgroundColor,
}: DoctorReviewsBlockProps) {
  const reviews = relatedReviews ?? [];

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Отзывы о враче"
      className="flex flex-col gap-10"
    >
      <Heading
        level={2}
        variant="reviews-heading"
        className="text-unident-dark"
      >
        Отзывы о враче
      </Heading>

      <DoctorReviewsListClient
        reviews={reviews}
        clinicLogoUrl={clinicLogoUrl}
        clinicAvatarBackgroundColor={clinicAvatarBackgroundColor}
      />
    </section>
  );
}
