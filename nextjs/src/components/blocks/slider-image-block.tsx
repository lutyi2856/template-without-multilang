"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { SliderImageBlockAttrs } from "./types";

export function SliderImageBlock({
  title,
  text,
  images = [],
  marginBottom = 40,
}: SliderImageBlockAttrs) {
  const validImages = images ?? [];
  const hasContent = title || text || validImages.length > 0;

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

  if (!hasContent) return null;

  return (
    <section style={{ marginBottom: `${marginBottom}px` }}>
      {title && (
        <Heading
          level={2}
          className={cn(typography.figma["block-content-title"], "mb-4")}
        >
          {title}
        </Heading>
      )}
      {text && (
        <Text
          variant="block-content-body"
          className="text-unident-dark mb-6"
        >
          {text}
        </Text>
      )}
      {validImages.length > 0 && (
        <div className="relative w-full">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5">
              {validImages.map((img, idx) => (
                <div
                  key={idx}
                  className="min-w-0 flex-[0_0_100%] rounded-[25px] overflow-hidden"
                >
                  <div className="relative w-full aspect-video">
                    <Image
                      src={img.url}
                      alt={img.alt || `Слайд ${idx + 1}`}
                      width={img.width || 1220}
                      height={img.height || 686}
                      className="object-cover w-full h-full"
                      sizes="100vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {validImages.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {validImages.map((_, index) => (
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
        </div>
      )}
    </section>
  );
}
