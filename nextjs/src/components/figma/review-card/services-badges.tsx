"use client";

import React, { useCallback } from "react";
import { Text } from "@/components/design-system";
import { ServicesBadgesProps } from "./types";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { SliderNavigation } from "./slider-navigation";

/**
 * Бейджи услуг врача с Embla Carousel (Level 3 slider)
 *
 * КРИТИЧНО: Услуги берутся из doctor.relatedServices (НЕ из review!)
 *
 * DESIGN:
 * - Белый фон (#FFFFFF)
 * - Border radius: 10px
 * - Embla Carousel (если услуг > 2)
 * - Стрелки навигации (показываем если > 2 услуг)
 *
 * TYPOGRAPHY: review-service-badge (16px, medium)
 *
 * DATA SOURCE: doctor.relatedServices (из WordPress bidirectional relationship)
 *
 * PERFORMANCE: Client Component только для слайдера
 * Bundle: +3KB (Embla core)
 */
export function ServicesBadges({ services }: ServicesBadgesProps) {
  if (!services || services.length === 0) return null;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    skipSnaps: false,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

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
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Показываем стрелки ТОЛЬКО если услуг больше 1 (overflow)
  const showNavigation =
    services.length > 1 && (canScrollPrev || canScrollNext);

  return (
    <div className="space-y-3">
      {/* Заголовок + Стрелки */}
      <div className="flex items-center gap-2">
        <Text variant="review-meta" className="text-unident-textGray">
          Оказанные услуги
        </Text>

        {showNavigation && (
          <SliderNavigation
            onPrev={scrollPrev}
            onNext={scrollNext}
            canScrollPrev={canScrollPrev}
            canScrollNext={canScrollNext}
            size="small"
          />
        )}
      </div>

      {/* Embla Slider */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {services.map((service) => (
            <div key={service.id} className="flex-[0_0_100%] min-w-0">
              <Link
                href={`/services/${service.slug}`}
                className="inline-block"
              >
                <div className="bg-unident-white rounded-[10px] px-4 py-3 w-fit xl:px-[clamp(0.75rem,1.45vw,1.25rem)] xl:py-[clamp(0.5rem,1.09vw,0.9375rem)]">
                  <Text
                    variant="review-service-badge"
                    className="text-unident-dark"
                  >
                    {service.title}
                  </Text>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
