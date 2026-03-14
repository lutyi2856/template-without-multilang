"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { Text, Heading } from "@/components/design-system";
import { cn } from "@/lib/utils";
import { decodeHtmlEntities } from "@/lib/utils/html-entities";
import { getPromotionPrice } from "@/lib/utils/promotion-price";
import type { Promotion } from "@/types/promotion";

interface ServicePromoBannerClientProps {
  promotions: Promotion[];
}

/**
 * Рассчитать процент скидки из Price (regularPrice, promoPrice)
 */
function getDiscountPercent(promotion: Promotion): number | null {
  const firstPrice = getPromotionPrice(promotion);
  if (!firstPrice?.regularPrice || !firstPrice?.promoPrice) return null;
  const regular = Number(firstPrice.regularPrice);
  const promo = Number(firstPrice.promoPrice);
  if (regular <= 0) return null;
  return Math.round((1 - promo / regular) * 100);
}

/**
 * Санитизация excerpt: удалить HTML-теги и паттерны CSS-селекторов
 * (например p.font-gilroy.font-normal.text-[14px]... попавший при копировании из Figma/кода).
 * Удаляет по всей строке, не только в начале.
 */
function sanitizeExcerpt(raw: string): string {
  const stripped = raw.replace(/<[^>]*>/g, "").trim();
  return stripped
    .replace(/\s*[a-z]+(\.[a-zA-Z0-9\[\]\(\)_-]+)+\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Сформировать текст скидки: только discountLabelText + % при showDiscountPercent.
 * Не использовать title как fallback.
 */
function getDiscountLabelText(promotion: Promotion): string | null {
  const label = promotion.promotionFields?.discountLabelText?.trim() ?? "";
  const showPercent = promotion.promotionFields?.showDiscountPercent !== false;
  const percent = showPercent ? getDiscountPercent(promotion) : null;

  if (label && /\d+%/.test(label)) {
    return label;
  }

  if (percent != null && percent > 0) {
    return label ? `${label} ${percent}%` : `${percent}%`;
  }

  if (label) {
    return label;
  }

  return null;
}

/** Извлечь sourceUrl из featuredImage (node, nodes[0], или плоская структура) */
function getFeaturedImageUrl(fi: Promotion["featuredImage"]): string | undefined {
  if (!fi) return undefined;
  const f = fi as unknown as {
    node?: { sourceUrl?: string };
    nodes?: Array<{ sourceUrl?: string }>;
    sourceUrl?: string;
  };
  const node = f.node ?? (Array.isArray(f.nodes) ? f.nodes[0] : undefined);
  return node?.sourceUrl ?? f.sourceUrl;
}

function PromoBannerSlide({ promotion }: { promotion: Promotion }) {
  const discountText = getDiscountLabelText(promotion);
  const excerpt =
    decodeHtmlEntities(sanitizeExcerpt(promotion.excerpt ?? "")) || "";
  const rawUrl = getFeaturedImageUrl(promotion.featuredImage);
  const [imgError, setImgError] = useState(false);
  const imageSrc = imgError || !rawUrl ? "/images/figma/promo-people.png" : rawUrl;
  const imageAlt =
    (promotion.featuredImage as { node?: { altText?: string }; altText?: string })?.node?.altText ??
    (promotion.featuredImage as { altText?: string })?.altText ??
    promotion.title ??
    "Промо-акция";

  return (
    <Link href={`/promotions/${promotion.slug}`} className="block">
      <section
        className="relative w-full rounded-[25px] overflow-hidden min-h-[313px] max-md:min-h-0"
        aria-labelledby={`service-promo-banner-title-${promotion.id}`}
      >
        {/* Gradient background — fill_MNMSMN (886:4523), fluid-layout: вынесен в CSS */}
        <div
          className="absolute inset-0 rounded-[25px] bg-promo-banner-gradient"
          aria-hidden
        />

        <div className="relative flex flex-col lg:flex-row lg:items-stretch min-h-[288px] lg:min-h-[clamp(300px,30vw,436px)] max-md:min-h-0">
          {/* Левая часть — badge + текст (Figma px→%: 685/1380=49.64%) */}
          <div className="flex flex-col gap-0 pl-[clamp(1.25rem,0.8rem+2.2vw,2.55rem)] pr-4 pt-[clamp(1rem,0.7rem+1.2vw,1.56rem)] pb-[clamp(1rem,2vw,2rem)] max-md:pl-5 max-md:pr-5 max-md:pt-6 max-md:pb-6 flex-1 min-w-0 z-10">
            {/* Badge + текст — 90% ширины контейнера */}
            <div className="w-[90%] flex flex-col gap-0">
            <div
              className="inline-flex items-center justify-center min-w-[177px] w-[177px] h-[35px] rounded-[27px] bg-unident-primaryLight shrink-0 mb-[clamp(1rem,1.5vw,1.44rem)] max-md:mb-4"
            >
              <span className="font-gilroy font-medium text-[14px] leading-[1.177] tracking-[-0.01em] text-white">
                Горячее предложение
              </span>
            </div>

            {/* Текстовый блок */}
            <div className="flex flex-col gap-[10px] w-full">
              <Heading
                level={2}
                id={`service-promo-banner-title-${promotion.id}`}
                className="font-gilroy font-semibold text-[28px] leading-[1.193] tracking-[-0.01em] text-unident-dark"
              >
                {promotion.title}
              </Heading>
              {discountText != null && (
                <Text
                  as="span"
                  className="font-gilroy font-semibold text-[28px] leading-[1.193] tracking-[-0.01em] text-unident-primaryLight w-[60%]"
                >
                  {discountText}
                </Text>
              )}
              {excerpt && (
                <Text variant="promo-banner-excerpt" className="w-[60%]">{excerpt}</Text>
              )}
            </div>
            </div>
          </div>

          {/* Изображение — featuredImage справа (Figma px→%: 619/1380=44.86%) */}
          <div className="relative z-10 w-full lg:w-[44.86%] lg:max-w-[619px] lg:min-h-[436px] lg:shrink-0 lg:self-end overflow-hidden max-md:order-first max-md:aspect-[619/436] max-md:max-h-[280px]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={619}
              height={436}
              className="object-cover w-full h-full lg:absolute lg:right-0 lg:top-0 lg:w-full lg:h-full"
              sizes="(max-width: 1024px) 100vw, 619px"
              onError={() => setImgError(true)}
            />
          </div>
        </div>
      </section>
    </Link>
  );
}

/**
 * ServicePromoBannerClient — слайдер промо-баннеров на странице услуги
 * Figma 886:4523, паттерн blog-hero-slider-client
 */
export function ServicePromoBannerClient({
  promotions,
}: ServicePromoBannerClientProps) {
  const validPromotions = (promotions ?? []).filter(
    (p): p is Promotion => p != null && p.id != null
  );

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

  if (validPromotions.length === 0) return null;

  return (
    <div className="relative w-full pb-14 max-md:pb-12">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-0">
          {validPromotions.map((promotion) => (
            <div key={promotion.id} className="min-w-0 flex-[0_0_100%]">
              <PromoBannerSlide promotion={promotion} />
            </div>
          ))}
        </div>
      </div>

      {validPromotions.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-[14px] z-10"
          role="tablist"
          aria-label="Слайды промо-баннера"
        >
          {validPromotions.map((_, index) => (
            <div
              key={index}
              className="relative w-[10px] h-[10px] shrink-0"
              role="presentation"
            >
              <button
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                onClick={() => scrollTo(index)}
                className="absolute -inset-[17px] flex items-center justify-center p-0"
                aria-label={`Слайд ${index + 1}`}
              >
                <span
                  className={cn(
                    "block w-[10px] h-[10px] shrink-0 rounded-[18px] transition-colors",
                    index === selectedIndex ? "bg-unident-primaryLight" : "bg-[#D3DAE5]"
                  )}
                  aria-hidden
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
