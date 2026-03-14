"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import type { MainPageLicenseItem } from "@/types/main-page";
import { SliderNavigation } from "@/components/figma/review-card/slider-navigation";
import { Container, Heading, Text } from "@/components/design-system";
import { cn } from "@/lib/utils";

export interface LicensesSectionClientProps {
  title?: string;
  items?: MainPageLicenseItem[] | null;
}

/**
 * LicensesSectionClient - слайдер карточек лицензий.
 * Как в DoctorsSectionClient: каждая карточка — отдельный слайд, листаем по одной.
 */
export function LicensesSectionClient({
  title,
  items = [],
}: LicensesSectionClientProps) {
  const list = items ?? [];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
    skipSnaps: false,
  });

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

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
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect, list.length]);

  if (!list.length) {
    return null;
  }

  return (
    <Container size="xl">
      <div className="bg-unident-bgLightGray rounded-[25px] p-[15px] md:py-12 md:px-[68px] min-w-0">
        {/* Header: заголовок + стрелки */}
        <div className="flex flex-col flex-wrap md:flex-row md:flex-wrap md:items-start md:justify-between mb-[clamp(1.875rem,1.48rem+1.69vw,3rem)] gap-6">
          <div className="flex-1">
            {title && (
              <Heading
                level={2}
                variant="section-title"
                className="text-unident-dark font-gilroy text-[32px] font-bold leading-tight tracking-[-0.02em]"
              >
                {title}
              </Heading>
            )}
          </div>

          {list.length > 1 && (
            <div className="flex items-center justify-end md:justify-start gap-4 w-full md:w-auto">
              <SliderNavigation
                onPrev={scrollPrev}
                onNext={scrollNext}
                canScrollPrev={canScrollPrev}
                canScrollNext={canScrollNext}
                size="large"
                background="white"
              />
            </div>
          )}
        </div>

        {/* Viewport с фиксированной шириной под 1 / 2 / 4 слайда (288 / 596 / 1212) — без обрезка следующей карточки */}
        <div
          className="overflow-hidden w-[288px] md:w-[596px] lg:w-[1212px] max-w-full mx-auto"
          ref={emblaRef}
          data-slider="licenses"
        >
          <div className="flex gap-5">
            {list.map((item, idx) => (
              <div
                key={idx}
                className="flex-[0_0_auto] min-w-0 w-[288px] shrink-0"
              >
                <article
                  className="rounded-[25px] overflow-hidden flex flex-col h-full bg-transparent"
                  aria-labelledby={
                    item.licenseTitle ? `license-title-${idx}` : undefined
                  }
                >
                  {item.image?.url ? (
                    <div className="relative w-full bg-white shrink-0 rounded-[25px] py-[15px] px-[15px] md:py-5 md:px-[38px] flex flex-col min-h-0">
                      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[10px]">
                        <Image
                          src={item.image.url}
                          alt={
                            item.image.alt ||
                            item.licenseTitle ||
                            "Изображение лицензии"
                          }
                          width={item.image.width ?? 300}
                          height={item.image.height ?? 400}
                          className="object-cover w-full h-full min-h-0"
                          sizes="288px"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/4] bg-white shrink-0 rounded-[25px] py-[15px] px-[15px] md:py-5 md:px-[38px] flex items-center justify-center">
                      <Text variant="small" className="text-unident-textGray">
                        Нет изображения
                      </Text>
                    </div>
                  )}
                  <div className="p-4 md:p-5 flex flex-col gap-2 shrink-0 h-[7.5rem] overflow-y-auto">
                    {item.licenseTitle && (
                      <div
                        id={
                          item.licenseTitle ? `license-title-${idx}` : undefined
                        }
                      >
                        <Heading
                          level={3}
                          variant="card-title"
                          className="text-unident-dark shrink-0"
                        >
                          {item.licenseTitle}
                        </Heading>
                      </div>
                    )}
                    {item.textLicenzia && (
                      <Text variant="small" className="text-unident-textGray">
                        {item.textLicenzia}
                      </Text>
                    )}
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {list.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: list.length }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === selectedIndex
                    ? "bg-unident-primary w-6"
                    : "bg-unident-borderGray hover:bg-unident-primary/50",
                )}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
