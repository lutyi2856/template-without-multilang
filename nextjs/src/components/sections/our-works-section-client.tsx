"use client";

import React, { useCallback } from "react";
import { Heading, Button, Container } from "@/components/design-system";
import { CaseCard } from "@/components/figma/case";
import { SliderNavigation } from "@/components/figma/review-card/slider-navigation";
import { OurWork } from "@/lib/wordpress/types/our-work";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

interface OurWorksSectionClientProps {
  works: OurWork[];
}

/**
 * Client обертка для OurWorksSection с Embla Carousel
 *
 * Responsive slider (CSS-driven, no useMediaQuery):
 * - Mobile: 1 карточка
 * - Tablet/Desktop: 2 карточки
 * - Loop режим, стрелки навигации
 */
export function OurWorksSectionClient({ works }: OurWorksSectionClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
    skipSnaps: false,
  });

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Container size="xl">
      {/* Внутренний контейнер с фоном и скруглением по Figma */}
      <div className="bg-unident-bgLightGray rounded-[25px] p-[15px] md:p-12 min-w-0">
        {/* Header: Заголовок + Стрелки + Кнопка */}
        <div className="flex flex-col flex-wrap md:flex-row md:items-start md:justify-between mb-[clamp(1.875rem,1.48rem+1.69vw,3rem)] gap-6">
          {/* Заголовок */}
          <Heading level={2} variant="doctors-heading" className="text-unident-dark">
            Наши работы
          </Heading>

          {/* Правая часть: на mobile — кнопка full width, стрелки ниже справа; на md+ — стрелки + кнопка */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
            <Link href="/our-works" className="w-full md:w-auto md:order-2">
              <Button
                unidentVariant="outline"
                className="w-full md:min-w-[160px] px-6 py-3 border border-unident-primary text-unident-primary rounded-[15px] text-[16px] font-semibold leading-[1.193] tracking-[-0.01em] hover:bg-unident-primary hover:text-white transition-colors"
              >
                Все работы
              </Button>
            </Link>
            <SliderNavigation
              onPrev={scrollPrev}
              onNext={scrollNext}
              canScrollPrev={canScrollPrev}
              canScrollNext={canScrollNext}
              size="large"
              background="white"
              className="self-end md:order-1 md:self-auto"
            />
          </div>
        </div>

        {/* EMBLA CAROUSEL — responsive-slider: 1 mobile, 2 tablet/desktop */}
        <div className="overflow-hidden" ref={emblaRef} data-slider="our-works">
          <div className="grid grid-flow-col auto-cols-[100%] md:auto-cols-[calc((100%-10px)/2)] gap-[10px]">
            {works.map((work) => (
              <div key={work.id} className="min-w-0 flex flex-col h-full">
                <CaseCard work={work} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots - Индикаторы слайдов */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "bg-unident-primary w-6"
                    : "bg-unident-borderGray hover:bg-unident-primary/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
