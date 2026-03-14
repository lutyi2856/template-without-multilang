"use client";

/**
 * Client-обёртка блока сертификатов: Embla carousel для >4 сертификатов.
 * Отображает 4 карточки за слайд, loop: false.
 */

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Heading } from "@/components/design-system";
import { SliderNavigation } from "@/components/figma/review-card/slider-navigation";
import { cn } from "@/lib/utils";
import type { CertificateItem } from "./types";

const CERT_WIDTH = 194;
const CERT_HEIGHT = 276;
const CERT_GAP = 19;
const CERTS_PER_SLIDE = 4;

export function DoctorCertificatesBlockClient({
  certificates,
}: {
  certificates: CertificateItem[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const slideContentWidth =
    CERTS_PER_SLIDE * CERT_WIDTH + (CERTS_PER_SLIDE - 1) * CERT_GAP;

  return (
    <div className="flex flex-col gap-10">
      <div
        className="flex flex-row items-start justify-between gap-4 w-full max-w-full"
        style={{ width: slideContentWidth, maxWidth: "100%" }}
      >
        <Heading
          level={2}
          variant="doctor-hero-title"
          className="text-unident-dark"
        >
          Сертификаты
        </Heading>
        <SliderNavigation
          onPrev={scrollPrev}
          onNext={scrollNext}
          canScrollPrev={canScrollPrev}
          canScrollNext={canScrollNext}
          size="large"
          background="white"
        />
      </div>
      <div
        className="overflow-hidden w-full max-w-full"
        ref={emblaRef}
        style={{ width: slideContentWidth, maxWidth: "100%" }}
      >
        <div
          className="flex"
          style={{ gap: CERT_GAP }}
        >
          {certificates.map((item, index) => (
            <div
              key={item.id}
              className="flex-[0_0_194px] shrink-0"
              style={{ flex: "0 0 194px" }}
            >
              <CertificateImageClient item={item} index={index} />
            </div>
          ))}
        </div>
      </div>

      {certificates.length > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: certificates.length }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === selectedIndex
                  ? "bg-unident-primary w-6"
                  : "bg-unident-borderGray hover:bg-unident-primary/50"
              )}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CertificateImageClient({
  item,
  index,
}: {
  item: CertificateItem;
  index: number;
}) {
  const alt = item.altText?.trim() || `Сертификат ${index + 1}`;
  return (
    <div
      className="relative w-[194px] aspect-[194/276] shrink-0 overflow-hidden rounded-[10px] bg-unident-bgElements"
      aria-label={alt}
    >
      <Image
        src={item.sourceUrl}
        alt={alt}
        width={item.mediaDetails?.width ?? CERT_WIDTH}
        height={item.mediaDetails?.height ?? CERT_HEIGHT}
        className="object-cover w-full h-full"
        sizes="194px"
      />
    </div>
  );
}
