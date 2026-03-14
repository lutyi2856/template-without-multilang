'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import type { BlogPostCard } from '@/types/blog';
import { BlogPostCard as BlogPostCardComponent } from '@/components/figma/blog/blog-post-card';
import { SliderNavigation } from '@/components/figma/review-card/slider-navigation';
import { Container, Heading, Button } from '@/components/design-system';
import { cn } from '@/lib/utils';

interface BlogSectionClientProps {
  posts: BlogPostCard[];
  title?: string;
  showJournalButton?: boolean;
}

/**
 * BlogSectionClient - слайдер постов: в видимой области 3 карточки (2 на tablet, 1 на mobile), стрелка листает по одной.
 */
export function BlogSectionClient({ posts, title, showJournalButton = true }: BlogSectionClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const showNavigation = posts.length > 1;
  const slideClass =
    'min-w-0 flex-[0_0_100%] md:flex-[0_0_calc((100%-11px)/2)] lg:flex-[0_0_calc((100%-22px)/3)] flex justify-center';

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <Container size="xl">
      <div className="bg-white rounded-[25px] py-8 px-0 md:py-12 md:px-0 min-w-0">
        <div className="flex flex-col flex-wrap md:flex-row md:items-start md:justify-between mb-[clamp(1.875rem,1.48rem+1.69vw,3rem)] gap-6">
          <div className="flex-1">
            <Heading level={2} variant="doctors-heading" className="text-unident-dark">
              {title || 'Самое интересное в блоге'}{' '}
              {!title && (
                <span className="inline-block" aria-hidden>
                  ✨
                </span>
              )}
            </Heading>
          </div>

          {showNavigation && (
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
              {showJournalButton && (
                <Link href="/blog" className="w-full md:w-auto md:order-2">
                  <Button
                    unidentVariant="outline"
                    className="w-full max-md:w-full md:min-w-[160px] px-6 py-3 border border-unident-primary text-unident-primary rounded-[15px] text-[16px] font-semibold leading-[1.193] tracking-[-0.01em] hover:bg-unident-primary hover:text-white transition-colors"
                  >
                    Журнал
                  </Button>
                </Link>
              )}
              <SliderNavigation
                onPrev={scrollPrev}
                onNext={scrollNext}
                canScrollPrev={prevBtnEnabled}
                canScrollNext={nextBtnEnabled}
                size="large"
                background="white"
                className="self-end md:order-1 md:self-auto"
              />
            </div>
          )}
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-[11px]">
            {posts.map((post) => (
              <div key={post.id} className={`${slideClass}`}>
                <BlogPostCardComponent post={post} />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && posts.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: posts.length }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollTo(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === selectedIndex
                    ? 'bg-unident-primary w-6'
                    : 'bg-unident-borderGray hover:bg-unident-primary/50'
                )}
                aria-label={`Перейти к посту ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
