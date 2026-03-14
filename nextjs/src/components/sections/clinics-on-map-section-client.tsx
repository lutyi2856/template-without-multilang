"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import dynamic from "next/dynamic";
import type { Clinic } from "@/lib/wordpress/api";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { SliderNavigation } from "@/components/figma/review-card/slider-navigation";
import {
  Container,
  Heading,
} from "@/components/design-system";
import { ClinicCard } from "./clinic-card";

/** Leaflet + OpenStreetMap — бесплатно, без API-ключа */
const ClinicsMap = dynamic(
  () => import("./clinics-map-osm").then((mod) => ({ default: mod.ClinicsMapOsm })),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 bg-unident-bgElements animate-pulse rounded-[25px]"
        aria-hidden
      />
    ),
  }
);

/** Ширина карточки: tablet/mobile 380px, desktop (Figma) 387px */
/** Высота изображения в карточке по макету Figma */
const CARD_IMAGE_HEIGHT = 258;
/** Высота изображения на планшете (md): на 40px меньше */
const CARD_IMAGE_HEIGHT_MD = 218;
/** Сдвиг карты вправо на планшете (px), чтобы маркер был виден — не под карточкой */
const MAP_CENTER_OFFSET_TABLET = 200;

export interface ClinicsOnMapSectionClientProps {
  clinics: Clinic[];
  title?: string;
}

/**
 * Карта во весь блок, поверх — одна карточка клиники (слайдер листает по одной).
 * Один state activeClinicIndex: смена слайда обновляет карту; клик по маркеру — слайд.
 */
export function ClinicsOnMapSectionClient({
  clinics,
  title = "Наши клиники на карте Москвы",
}: ClinicsOnMapSectionClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
    skipSnaps: false,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [activeClinicIndex, setActiveClinicIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
  const isTablet = useMediaQuery("(min-width: 768px)");

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
    setActiveClinicIndex(emblaApi.selectedScrollSnap());
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
  }, [emblaApi, onSelect, clinics.length]);

  const onMarkerClick = useCallback(
    (index: number) => {
      setActiveClinicIndex(index);
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  if (!clinics.length) {
    return null;
  }

  const cardContent = (
    <div className="flex items-center gap-2 sm:gap-0 flex-shrink-0">
              {clinics.length > 1 && (
                <div
                  className="flex-shrink-0 z-20 sm:-mr-6"
                  aria-label="Предыдущая клиника"
                >
                  <SliderNavigation
                    onPrev={scrollPrev}
                    onNext={scrollNext}
                    canScrollPrev={canScrollPrev}
                    canScrollNext={canScrollNext}
                    size="large"
                    background="white"
                    prevOnly
                  />
                </div>
              )}
              <div
                className="overflow-hidden flex-shrink-0 rounded-[25px] w-[min(100%,380px)] lg:w-[min(100%,387px)] max-w-full min-w-0"
                ref={emblaRef}
                data-slider="clinics-on-map"
              >
              <div className="flex">
                {clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className="flex-[0_0_100%] min-w-0 shrink-0 rounded-[25px] w-[min(100%,380px)] lg:w-[min(100%,387px)] max-w-full"
                  >
                    <ClinicCard
                      clinic={clinic}
                      imageHeight={CARD_IMAGE_HEIGHT}
                      imageHeightMd={CARD_IMAGE_HEIGHT_MD}
                    />
                  </div>
                ))}
              </div>
              </div>
              {clinics.length > 1 && (
                <div
                  className="flex-shrink-0 z-20 sm:-ml-6"
                  aria-label="Следующая клиника"
                >
                  <SliderNavigation
                    onPrev={scrollPrev}
                    onNext={scrollNext}
                    canScrollPrev={canScrollPrev}
                    canScrollNext={canScrollNext}
                    size="large"
                    background="white"
                    nextOnly
                  />
                </div>
              )}
    </div>
  );

  return (
    <Container size="xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="clinics-on-map">
          <Heading
            level={2}
            variant="section-title"
            className="text-unident-dark"
          >
            {title}
          </Heading>
        </div>

        {isTablet ? (
          /* Desktop/tablet: оригинальная структура — карта + overlay по центру */
          <div className="relative w-full min-h-[500px] aspect-[16/9] lg:h-[597px] lg:aspect-auto rounded-[25px] overflow-hidden bg-unident-bgElements">
            <div className="absolute inset-0 w-full h-full z-0">
              <ClinicsMap
                clinics={clinics}
                activeClinicIndex={activeClinicIndex}
                onMarkerClick={onMarkerClick}
                centerOffsetX={MAP_CENTER_OFFSET_TABLET}
              />
            </div>
            <div className="absolute left-4 right-4 top-4 bottom-4 sm:left-6 sm:top-6 sm:bottom-6 sm:right-auto md:top-1/2 md:-translate-y-1/2 md:bottom-auto z-[1000] flex items-center justify-start">
              {cardContent}
            </div>
          </div>
        ) : (
          /* Mobile: карточка сверху, карта full-width снизу */
          <div className="flex flex-col gap-4 -mx-5 w-[calc(100%+2.5rem)]">
            <div className="flex items-center justify-start px-5">
              {cardContent}
            </div>
            <div className="relative min-h-[500px] aspect-[16/9] rounded-[25px] overflow-hidden bg-unident-bgElements">
              <ClinicsMap
                clinics={clinics}
                activeClinicIndex={activeClinicIndex}
                onMarkerClick={onMarkerClick}
                centerOffsetX={0}
              />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
