import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getPromotionPrice } from '@/lib/utils/promotion-price';
import { Text, Heading } from '@/components/design-system';
import type { PromotionCardProps } from './types';

/**
 * PromotionCard - карточка акции для slider согласно Figma node 124:793
 *
 * Структура:
 * - Изображение сверху (featured image с 3-level fallback)
 * - Бейджи: "Акция" (static) + категория услуги (conditional)
 * - Название акции (2 строки max)
 * - Описание (из content)
 * - Цены: старая (зачеркнутая) + новая (conditional)
 * - Кнопка "Записаться"
 *
 * Размеры: 408px x 608px, border-radius: 25px
 */
export function PromotionCard({
  promotion,
  fallbackImage,
  variant = "dark",
  className,
}: PromotionCardProps & { className?: string }) {
  const isArchive = variant === "archive";
  const cardBg = isArchive ? "bg-unident-bgElements" : "bg-[#14294E]";
  const textColor = isArchive ? "text-unident-dark" : "text-white";
  const textMuted = isArchive ? "text-unident-textGray" : "text-white/90";
  const priceColor = isArchive ? "text-unident-dark" : "text-white";
  const priceStrike = isArchive ? "text-unident-textGray" : "text-white/60";
  const categoryBadgeClass = isArchive
    ? "bg-white border border-unident-borderGray text-unident-dark hover:bg-unident-bgTopbar"
    : "bg-white border border-white text-[#191E35] hover:bg-unident-bgElements";
  // 3-level image fallback: featured image -> fallback image -> SVG placeholder
  const imageUrl = 
    promotion.featuredImage?.node?.sourceUrl || 
    fallbackImage?.url || 
    null;
  
  const imageWidth = 
    promotion.featuredImage?.node?.mediaDetails?.width || 
    fallbackImage?.width || 
    408;
  
  const imageHeight = 
    promotion.featuredImage?.node?.mediaDetails?.height || 
    fallbackImage?.height || 
    250;
  
  const imageAlt = 
    promotion.featuredImage?.node?.altText || 
    fallbackImage?.alt || 
    promotion.title || 
    'Акция';
  
  // Category badge — прямая категория акции или первая категория первой связанной услуги (fallback)
  const firstService = promotion.relatedServices?.[0];
  const serviceCategory =
    promotion.serviceCategories?.nodes?.[0] ?? firstService?.serviceCategories?.nodes?.[0];
  const categoryName = serviceCategory?.name;
  const categorySlug = serviceCategory?.slug;
  
  const priceData = getPromotionPrice(promotion);
  const promoPrice = priceData?.promoPrice;
  const regularPrice = priceData?.regularPrice;
  const currency = priceData?.currency || 'RUB';
  const currencySymbol = currency === 'RUB' ? '₽' : currency;
  
  // Conditional pricing rendering:
  // - If no promoPrice → show nothing
  // - If promoPrice only → show promoPrice
  // - If both → show regularPrice (strikethrough) + promoPrice
  const showPricing = !!promoPrice;
  const showRegularPrice = showPricing && !!regularPrice;
  
  const promotionHref = `/promotions/${promotion.slug}`;

  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-[408px] rounded-[25px] overflow-hidden flex flex-col flex-1 min-h-0 transition-shadow hover:shadow-lg",
        cardBg,
        className
      )}
    >
      {/* Ссылка на акцию: только изображение (без вложенных <a>) */}
      <Link
        href={promotionHref}
        className={cn(
          "relative block w-full aspect-[408/250] min-h-[200px] flex items-center justify-center overflow-hidden rounded-b-[25px] shrink-0",
          cardBg
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isArchive ? "text-unident-textGray/30" : "text-white/30"}
          >
            <circle cx="50" cy="50" r="50" fill="currentColor" opacity="0.2" />
            <path
              d="M35 40c0-8.284 6.716-15 15-15s15 6.716 15 15-6.716 15-15 15-15-6.716-15-15z"
              fill="currentColor"
              opacity="0.5"
            />
            <path
              d="M30 65c0-11.046 8.954-20 20-20s20 8.954 20 20v10H30V65z"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>
        )}
      </Link>

      {/* Бейджи вне ссылки на акцию — нет вложенных ссылок, гидрация ок */}
      <div className="flex items-center gap-[10px] flex-wrap px-[20px] pt-[20px] pb-0">
        <div className="flex items-center justify-center py-1.5 px-[15px] bg-[#607BD4] rounded-[10px]">
          <Text variant="promotion-badge" className="text-white font-medium text-[14px] leading-none" as="span">
            Акция
          </Text>
        </div>
        {categoryName &&
          (categorySlug ? (
            <Link
              href={`/service-category/${categorySlug}`}
              className={cn(
                "flex items-center justify-center py-1.5 px-[15px] rounded-[10px] transition-colors",
                categoryBadgeClass
              )}
              aria-label={`Перейти к категории ${categoryName}`}
            >
              <Text variant="promotion-category" className="text-[16px] font-medium leading-none" as="span">
                {categoryName}
              </Text>
            </Link>
          ) : (
            <div
              className={cn(
                "flex items-center justify-center h-[30px] px-[15px] rounded-[10px]",
                categoryBadgeClass
              )}
            >
              <Text variant="promotion-category" className="text-[16px] font-medium leading-none" as="span">
                {categoryName}
              </Text>
            </div>
          ))}
      </div>

      {/* Ссылка на акцию: заголовок, текст, цены, кнопка */}
      <Link
        href={promotionHref}
        className={cn(
          "flex flex-col flex-1 min-h-0 p-[20px] pt-[15px]",
          cardBg
        )}
      >
        <Heading
          level={3}
          variant="card-title"
          className={cn("text-[22px] font-semibold leading-[1.2] line-clamp-2", textColor)}
        >
          {promotion.title}
        </Heading>

        {promotion.content && (
          <Text variant="default" className={cn("text-[16px] line-clamp-3", textMuted)} as="span">
            {promotion.content.replace(/<[^>]*>/g, "")}
          </Text>
        )}

        <div className="mt-auto flex flex-col gap-[15px]">
          {showPricing && (
            <div className="flex items-center gap-[10px]">
              <Text
                variant="promotion-promo-price"
                className={cn("text-[28px] font-medium leading-[1.4]", priceColor)}
                as="span"
              >
                {promoPrice!.toLocaleString("ru-RU")} {currencySymbol}
              </Text>
              {showRegularPrice && (
                <Text
                  variant="promotion-regular-price"
                  className={cn("text-[28px] font-medium leading-[1.4] line-through", priceStrike)}
                  as="span"
                >
                  {regularPrice!.toLocaleString("ru-RU")} {currencySymbol}
                </Text>
              )}
            </div>
          )}
          <span
            className={cn(
              "inline-flex items-center justify-center w-full min-h-[44px] py-4 text-[16px] font-semibold rounded-[15px] transition-colors",
              isArchive
                ? "border-[1px] border-unident-primary text-unident-primary bg-transparent hover:bg-unident-primary hover:text-white"
                : "border-[1px] border-white text-white bg-transparent hover:bg-white hover:text-[#14294E]"
            )}
          >
            Записаться
          </span>
        </div>
      </Link>
    </div>
  );
}
