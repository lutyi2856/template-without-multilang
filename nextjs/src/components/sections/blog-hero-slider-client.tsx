"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { BlogPostCard } from "@/types/blog";
import { BlogPostHeroCard } from "@/components/figma/blog/blog-post-hero-card";
import { cn } from "@/lib/utils";

interface BlogHeroSliderClientProps {
  posts: BlogPostCard[];
}

/**
 * BlogHeroSliderClient — hero-слайдер постов с dots (без стрелок)
 * Figma: слайдер с точками навигации
 */
export function BlogHeroSliderClient({ posts }: BlogHeroSliderClientProps) {
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

  if (posts.length === 0) return null;

  return (
    <div className="w-full mt-[15px] relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {posts.map((post) => (
            <div key={post.id} className="min-w-0 flex-[0_0_100%]">
              <BlogPostHeroCard post={post} />
            </div>
          ))}
        </div>
      </div>

      {posts.length > 1 && (
        <div className="absolute left-6 bottom-6 flex justify-start gap-2">
          {Array.from({ length: posts.length }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === selectedIndex
                  ? "bg-unident-primary w-6"
                  : "w-2 bg-unident-borderGray hover:bg-unident-primary/50"
              )}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
