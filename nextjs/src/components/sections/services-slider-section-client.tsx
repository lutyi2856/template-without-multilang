'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import { ServiceCard } from '@/components/figma/service-card';
import { SliderNavigation } from '@/components/figma/review-card/slider-navigation';
import { Container, Heading, Button } from '@/components/design-system';
import { cn } from '@/lib/utils';

export interface ServiceSliderItem {
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  iconSvg?: string | null;
}

interface ServicesSliderSectionClientProps {
  services: ServiceSliderItem[];
  title?: string;
}

/**
 * ServicesSliderSectionClient - слайдер услуг на странице услуги
 *
 * Responsive: 1 карточка mobile, 2 tablet, 3 desktop.
 * Навигация скрыта если услуг <= 3.
 */
export function ServicesSliderSectionClient({
  services,
  title = 'Другие услуги',
}: ServicesSliderSectionClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const showNavigation = services.length > 3;

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

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
      <div className="bg-unident-bgElements rounded-[25px] p-[15px] md:p-12 min-w-0">
        <div className="flex flex-row max-md:flex-col max-md:items-stretch md:items-start md:justify-between mb-[clamp(1.875rem,1.48rem+1.69vw,3rem)] gap-6">
          <div className="flex-1">
            <Heading level={2} variant="section-title" className="text-unident-dark">
              {title}
            </Heading>
          </div>

          {showNavigation && (
            <div className="flex flex-row max-md:flex-col items-center gap-4 w-full max-md:w-full md:w-auto">
              <Link href="/services" className="w-full max-md:w-full md:w-auto md:order-2 flex items-center justify-center">
                <Button
                  unidentVariant="primary"
                  className="w-full max-md:w-full md:min-w-[160px]"
                >
                  Все услуги
                </Button>
              </Link>
              <SliderNavigation
                onPrev={scrollPrev}
                onNext={scrollNext}
                canScrollPrev={true}
                canScrollNext={true}
                size="large"
                background="white"
                className="max-md:self-end md:order-1 md:self-auto"
              />
            </div>
          )}
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-[10px]">
            {services.map((service) => (
              <div
                key={service.id}
                className="min-w-0 flex flex-col flex-[0_0_100%] md:flex-[0_0_calc((100%-10px)/2)] lg:flex-[0_0_calc((100%-20px)/3)]"
              >
                <ServiceCard
                  name={service.title}
                  slug={service.slug}
                  iconSlug={service.icon ?? undefined}
                  iconSvg={service.iconSvg ?? undefined}
                  variant="gray"
                />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && services.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: services.length }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all min-w-[8px] min-h-[8px]',
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
