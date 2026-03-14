'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import type { Promotion } from '@/types/promotion';
import type { CtaImage } from '@/types/main-page';
import { PromotionCard } from '@/components/figma/promotion';
import { SliderNavigation } from '@/components/figma/review-card/slider-navigation';
import { Container, Heading, Button } from '@/components/design-system';
import { cn } from '@/lib/utils';

interface PromotionsSectionClientProps {
  promotions: Promotion[];
  title: string;
  description?: string;
  fallbackImage?: CtaImage | null;
}

/**
 * PromotionsSectionClient - slider с акциями (individual card pattern)
 *
 * Responsive behavior (CSS-driven, no JS resize listener):
 * - Desktop (lg): 3 карточки видно
 * - Tablet (md): 2 карточки видно
 * - Mobile: 1 карточка видно
 *
 * Navigation:
 * - Arrows и dots скрываются если промоций <= 3
 * - Dots = promotions.length (одна точка на каждую карточку)
 * - Scroll: по 1 карточке
 */
export function PromotionsSectionClient({ promotions, title, description, fallbackImage }: PromotionsSectionClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const showNavigation = promotions.length > 3;

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
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
      {/* Внутренний контейнер с фоном и скруглением по Figma */}
      <div className="bg-unident-bgLightGray rounded-[25px] p-[15px] md:p-12 min-w-0">
        {/* Header: Заголовок + Стрелки + Кнопка */}
        <div className="flex flex-col flex-wrap md:flex-row md:items-start md:justify-between mb-[clamp(1.875rem,1.48rem+1.69vw,3rem)] gap-6">
          {/* Заголовок */}
          <div className="flex-1">
            <Heading level={2} variant="doctors-heading" className="text-unident-dark mb-4">
              {title}
            </Heading>
            {description && (
              <p className="text-[18px] leading-relaxed text-[#191E35]">
                {description}
              </p>
            )}
          </div>

          {/* Правая часть: Стрелки + Кнопка (скрыта если промоций <= 3) */}
          {showNavigation && (
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
              <Link href="/promotions" className="w-full md:w-auto md:order-2">
                <Button
                  unidentVariant="outline"
                  type="button"
                  className="w-full md:min-w-[160px] px-6 py-3 border border-unident-primary text-unident-primary rounded-[15px] text-[16px] font-semibold leading-[1.193] tracking-[-0.01em] hover:bg-unident-primary hover:text-white transition-colors"
                >
                  Все акции
                </Button>
              </Link>
              <SliderNavigation
                onPrev={scrollPrev}
                onNext={scrollNext}
                canScrollPrev={true}
                canScrollNext={true}
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
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="min-w-0 flex flex-col flex-[0_0_100%] md:flex-[0_0_calc((100%-10px)/2)] lg:flex-[0_0_calc((100%-20px)/3)]"
              >
                <PromotionCard
                  promotion={promotion}
                  fallbackImage={fallbackImage}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots navigation — одна точка на каждую карточку */}
        {showNavigation && promotions.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: promotions.length }, (_, index) => (
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
                aria-label={`Перейти к карточке ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
