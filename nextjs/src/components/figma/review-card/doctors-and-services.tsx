"use client";

import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { Text } from "@/components/design-system";
import { ServicesBadges } from "./services-badges";
import { SliderNavigation } from "./slider-navigation";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface DoctorsAndServicesProps {
  align?: "start" | "end";
  doctors: Array<{
    id: string;
    title: string;
    slug: string;
    imageUrl?: string;
    specialization?: string;
    relatedServices?: Array<{
      id: string;
      title: string;
      slug: string;
    }>;
  }>;
}

/**
 * Объединенный компонент для врачей и услуг с синхронизацией слайдеров
 *
 * КРИТИЧНО: Показывает только услуги текущего выбранного врача
 * При переключении врача автоматически обновляются услуги
 *
 * DESIGN:
 * - Слайдер врачей управляет отображением услуг
 * - Один слайд врача = один набор услуг этого врача
 * - Стрелки расположены после текста заголовка
 */
export function DoctorsAndServices({
  doctors,
  align = "start",
}: DoctorsAndServicesProps) {
  if (!doctors || doctors.length === 0) return null;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    skipSnaps: false,
    containScroll: "trimSnaps",
  });

  const [selectedDoctorIndex, setSelectedDoctorIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const currentIndex = emblaApi.selectedScrollSnap();
    setSelectedDoctorIndex(currentIndex);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Текущий выбранный врач
  const currentDoctor = doctors[selectedDoctorIndex];

  // Показываем стрелки ТОЛЬКО если есть overflow (можем скроллить)
  const showNavigation = doctors.length > 1 && (canScrollPrev || canScrollNext);

  return (
    <div
      className={cn(
        "flex flex-col gap-[10px] min-w-0 xl:flex-row xl:items-start xl:gap-[clamp(1rem,1.74vw,1.5rem)]",
        align === "end" && "items-end"
      )}
    >
      {/* Слайдер врачей с синхронизацией */}
      <div className="space-y-3 min-w-0 xl:flex-[0_1_auto]">
        {/* Заголовок + Стрелки */}
        <div
          className={cn(
            "flex items-center gap-2",
            align === "end" && "justify-end"
          )}
        >
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

        {/* Embla Slider для врачей */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="flex-[0_0_100%] min-w-0 w-full">
                <Link
                  href={`/doctors/${doctor.slug}`}
                  className="flex items-center gap-3 w-full min-w-0"
                >
                  {/* Фото врача */}
                  {doctor.imageUrl && (
                    <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden bg-unident-bgElements flex-shrink-0">
                      <Image
                        src={doctor.imageUrl}
                        alt={doctor.title}
                        fill
                        sizes="(max-width: 1279px) 60px, 60px"
                        className="object-cover object-top"
                      />
                    </div>
                  )}

                  {/* Имя и специализация — блок на всю ширину */}
                  <div className="min-w-0 flex-1">
                    <Text
                      variant="review-answer"
                      className="text-unident-dark block break-words"
                    >
                      {doctor.title}
                    </Text>
                    {doctor.specialization && (
                      <Text
                        variant="review-doctor-title"
                        className="text-unident-textGray block break-words"
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

      {/* Услуги ТОЛЬКО текущего врача */}
      {currentDoctor?.relatedServices &&
        currentDoctor.relatedServices.length > 0 && (
          <div className="min-w-0 xl:flex-[0_1_auto]">
            <ServicesBadges services={currentDoctor.relatedServices} />
          </div>
        )}
    </div>
  );
}
