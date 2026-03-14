"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { Text } from "@/components/design-system";
import { DoctorsListProps } from "./types";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { SliderNavigation } from "./slider-navigation";

/**
 * Список лечащих врачей в отзыве
 *
 * DESIGN:
 * - Embla Carousel слайдер (если врачей > 1)
 * - Круглые фото врачей (60px)
 * - Имя + специализация
 * - Стрелки навигации (показываем если > 1 врача)
 *
 * TYPOGRAPHY:
 * - Имя: review-answer (18px, medium)
 * - Специализация: review-doctor-title (12px, medium)
 *
 * PERFORMANCE: Client Component только для слайдера
 * Bundle: +3KB (Embla core)
 */
export function DoctorsList({ doctors }: DoctorsListProps) {
  if (!doctors || doctors.length === 0) return null;

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

  // Показываем стрелки ТОЛЬКО если есть overflow (можем скроллить)
  const showNavigation = doctors.length > 1 && (canScrollPrev || canScrollNext);

  return (
    <div className="space-y-3">
      {/* Заголовок + Стрелки */}
      <div className="flex items-center gap-2">
        <Text variant="review-meta" className="text-unident-textGray">
          Лечащие врачи
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
          {doctors.map((doctor) => (
            <div key={doctor.id} className="flex-[0_0_100%] min-w-0">
              <Link
                href={`/doctors/${doctor.slug}`}
                className="flex items-center gap-3"
              >
                {/* Фото врача */}
                {doctor.imageUrl && (
                  <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-unident-bgElements flex-shrink-0">
                    <Image
                      src={doctor.imageUrl}
                      alt={doctor.title}
                      width={60}
                      height={60}
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Имя и специализация */}
                <div className="min-w-0">
                  <Text
                    variant="review-answer"
                    className="text-unident-dark truncate"
                  >
                    {doctor.title}
                  </Text>
                  {doctor.specialization && (
                    <Text
                      variant="review-doctor-title"
                      className="text-unident-textGray truncate"
                    >
                      {doctor.specialization}
                    </Text>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
