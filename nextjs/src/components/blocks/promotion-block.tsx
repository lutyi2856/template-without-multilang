"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PromotionBlockAttrs, PromotionBlockSlide } from "./types";

function PromotionSlide({
  slide,
}: {
  slide: PromotionBlockSlide;
}) {
  const desktopImg = slide.imageDesktop ?? slide.imageMobile;
  const mobileImg = slide.imageMobile ?? slide.imageDesktop;
  const imgSrc = desktopImg?.url ?? "";
  const mobileSrc = mobileImg?.url ?? imgSrc;
  const showMobileSource = mobileSrc && mobileImg !== desktopImg;
  const alt = desktopImg?.alt || mobileImg?.alt || "Промо-баннер";

  if (!imgSrc) return null;

  const content = (
    <div className="relative w-full aspect-[1220/177] max-h-[177px] overflow-hidden rounded-[25px]">
      {showMobileSource ? (
        <>
          <div className="absolute inset-0 max-md:block md:hidden">
            <Image
              src={mobileSrc}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1220px"
            />
          </div>
          <div className="absolute inset-0 max-md:hidden md:block">
            <Image
              src={imgSrc}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1220px"
            />
          </div>
        </>
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          width={1220}
          height={177}
          className="w-full h-full object-cover"
          sizes="(max-width: 768px) 100vw, 1220px"
        />
      )}
    </div>
  );

  if (slide.link) {
    return (
      <Link href={slide.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function PromotionBlock({ slides = [], marginBottom = 40 }: PromotionBlockAttrs) {
  const validSlides = slides ?? [];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

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
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (validSlides.length === 0) return null;

  return (
    <section className="relative pb-14 max-md:pb-12" style={{ marginBottom: `${marginBottom}px` }}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-0">
          {validSlides.map((slide, index) => (
            <div key={index} className="min-w-0 flex-[0_0_100%]">
              <PromotionSlide slide={slide} />
            </div>
          ))}
        </div>
      </div>

      {validSlides.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-[14px] z-10"
          role="tablist"
          aria-label="Слайды промо-баннера"
        >
          {validSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
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
    </section>
  );
}
