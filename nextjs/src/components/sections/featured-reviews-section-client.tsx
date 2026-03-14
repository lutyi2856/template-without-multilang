'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import { ReviewCard } from '@/components/figma/review-card';
import { SliderNavigation } from '@/components/figma/review-card/slider-navigation';
import { Container, Heading, Button } from '@/components/design-system';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/wordpress/types/review';

interface FeaturedReviewsSectionClientProps {
  reviews: Review[];
  clinicLogoUrl?: string;
  clinicAvatarBackgroundColor?: string;
}

/**
 * Слайдер отзывов (посты CPT reviews) на главной.
 *
 * Responsive behavior (CSS-driven):
 * - Desktop (lg): 3 карточки видно
 * - Tablet (md): 2 карточки видно
 * - Mobile: 1 карточка видно
 *
 * Dots = reviews.length (одна точка на каждый отзыв), scroll по 1 карточке.
 */
export function FeaturedReviewsSectionClient({
  reviews,
  clinicLogoUrl,
  clinicAvatarBackgroundColor,
}: FeaturedReviewsSectionClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const showNavigation = reviews.length > 3;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Container size="xl">
      <div className="bg-unident-bgLightGray rounded-[25px] p-[15px] md:p-12 min-w-0">
        <div className="flex flex-col flex-wrap md:flex-row md:items-start md:justify-between mb-[clamp(1.875rem,1.48rem+1.69vw,3rem)] gap-6">
          <div className="flex-1">
            <Heading level={2} variant="reviews-heading" className="text-unident-dark mb-4">
              Отзывы пациентов
            </Heading>
            <p className="text-[18px] leading-relaxed text-[#191E35]">
              Реальные отзывы о клинике и врачах
            </p>
          </div>

          {showNavigation && (
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
              <Link href="/reviews" className="w-full md:w-auto md:order-2">
                <Button
                  unidentVariant="outline"
                  className="w-full md:min-w-[160px] px-6 py-3 border border-unident-primary text-unident-primary rounded-[15px] text-[16px] font-semibold leading-[1.193] tracking-[-0.01em] hover:bg-unident-primary hover:text-white transition-colors"
                >
                  Все отзывы
                </Button>
              </Link>
              <SliderNavigation
                onPrev={scrollPrev}
                onNext={scrollNext}
                canScrollPrev={prevBtnEnabled}
                canScrollNext={nextBtnEnabled}
                size="large"
                background="white"
                className="self-end md:order-1 md:self-auto"
              />
            </div>
          )}
        </div>

        {/* EMBLA CAROUSEL — каждая карточка отдельный слайд, responsive ширина через CSS */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-[10px]">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="min-w-0 flex-[0_0_100%]"
              >
                <ReviewCard
                  review={review}
                  clinicAvatarUrl={clinicLogoUrl}
                  clinicAvatarBackgroundColor={clinicAvatarBackgroundColor}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots navigation — одна точка на каждый отзыв */}
        {showNavigation && reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: reviews.length }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === selectedIndex
                    ? 'bg-unident-primary w-6'
                    : 'bg-unident-borderGray hover:bg-unident-primary/50'
                )}
                aria-label={`Перейти к отзыву ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
