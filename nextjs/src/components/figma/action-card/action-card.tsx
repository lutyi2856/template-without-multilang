"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/currency";
import { getPromotionPrice } from "@/lib/utils/promotion-price";
import { Text } from "@/components/design-system";
import { DynamicIcon } from "@/components/dynamic-icon";
import { Countdown } from "./countdown";
import type { ActionCardProps } from "./types";

/**
 * ActionCard - карточка акции согласно Figma node 10:191
 *
 * Структура (flexbox layout):
 * - Контейнер: flex column с padding
 * - Badge + Countdown наверху
 * - Content (title, features, price, button) - flex column с gap
 * - Product Image - абсолютное позиционирование справа (декоративный элемент)
 *
 * Размеры: 447x608px, border-radius: 25px
 */
export function ActionCard({ data, className }: ActionCardProps) {
  const endDate = data.promotionFields?.endDate;
  const futures = data.promotionFutures || [];
  const actionIcon = data.promotionFields?.actionIcon ?? null;
  const actionIconSvg = data.actionIconSvg ?? null;
  // Используем featuredImage из WordPress поста (не ACF поле)
  const productImage = data.featuredImage?.node?.sourceUrl;
  const productWidth = data.featuredImage?.node?.mediaDetails?.width || 249;
  const productHeight = data.featuredImage?.node?.mediaDetails?.height || 266;

  // Проверяем что акция еще не истекла для показа контейнера countdown
  const isExpired = endDate
    ? new Date(endDate).getTime() <= new Date().getTime()
    : true;

  // Приоритет: прямая связь Promotion → Price, fallback: цепочка Service → Price, затем promotionFields.price
  let displayPrice: string | null = null;
  const priceData = getPromotionPrice(data as Parameters<typeof getPromotionPrice>[0]);

  if (priceData?.promoPrice != null) {
    const symbol = getCurrencySymbol(priceData.currency || "RUB");
    displayPrice = `${priceData.promoPrice.toLocaleString("ru-RU")} ${symbol}`;
  } else if (priceData?.regularPrice != null) {
    const symbol = getCurrencySymbol(priceData.currency || "RUB");
    displayPrice = `${priceData.regularPrice.toLocaleString("ru-RU")} ${symbol}`;
  } else if (data.promotionFields?.price) {
    displayPrice = data.promotionFields.price;
  }

  return (
    <div
      className={cn(
        "relative w-full min-w-0 lg:w-[clamp(300px,31vw,447px)] lg:min-h-[608px] lg:max-w-[447px] bg-[#F9F9F9] rounded-[25px] overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Product Image - абсолютное позиционирование справа (декоративный элемент) */}
      {productImage && (
        <div className="absolute right-0 bottom-0 w-[249px] aspect-[249/266] opacity-90 pointer-events-none hidden lg:block">
          <Image
            src={productImage}
            alt={data.title || "Товар"}
            width={productWidth}
            height={productHeight}
            className="object-contain w-full h-full"
          />
        </div>
      )}

      {/* Основной контент - flex column с padding */}
      <div className="relative z-10 flex flex-col p-[26px] flex-1">
        {/* Badge + Countdown - наверху в одну строку */}
        <div className="flex items-center gap-[9px] mb-[20px]">
          {/* Badge "Акция" + иконка из action_icon (если выбрана) */}
          <div className="flex items-center justify-center gap-2 min-w-[90px] py-2 px-3 bg-[#526AC2] rounded-[27px]">
            {(actionIcon || actionIconSvg) && (
              <DynamicIcon
                name={actionIcon ?? undefined}
                svgMarkup={actionIconSvg}
                className="w-[18px] h-[18px] text-white flex-shrink-0"
              />
            )}
            <Text variant="action-card-badge" className="text-white">
              Акция
            </Text>
          </div>

          {/* Countdown - показываем только если есть endDate и акция еще не истекла */}
          {endDate && !isExpired && (
            <div className="flex items-center justify-center gap-[5px] min-w-[147px] py-2 bg-white rounded-[27px] px-3">
              {/* Clock icon - точная копия из Figma (node 34:12) */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <g filter="url(#filter0_i_34_12)">
                  <path
                    d="M19.1387 9.56934C19.1387 14.8543 14.8543 19.1387 9.56934 19.1387C4.28434 19.1387 0 14.8543 0 9.56934C0 4.28434 4.28434 0 9.56934 0C14.8543 0 19.1387 4.28434 19.1387 9.56934Z"
                    fill="#607BD4"
                  />
                </g>
                <g clipPath="url(#clip0_34_12)">
                  <path
                    d="M9.56934 14.6826C6.74541 14.6826 4.45605 12.3933 4.45605 9.56934C4.45605 6.74541 6.74541 4.45605 9.56934 4.45605C12.3933 4.45605 14.6826 6.74541 14.6826 9.56934C14.6826 12.3933 12.3933 14.6826 9.56934 14.6826ZM10.0342 6.54785H9.10449V9.76178L10.9639 11.6212L11.6212 10.9639L10.0342 9.37689V6.54785Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <filter
                    id="filter0_i_34_12"
                    x="0"
                    y="0"
                    width="19.1387"
                    height="21.3387"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="3" />
                    <feGaussianBlur stdDeviation="1.1" />
                    <feComposite
                      in2="hardAlpha"
                      operator="arithmetic"
                      k2="-1"
                      k3="1"
                    />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0.551946 0 0 0 0 0.551946 0 0 0 0 0.551946 0 0 0 0.25 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="shape"
                      result="effect1_innerShadow_34_12"
                    />
                  </filter>
                  <clipPath id="clip0_34_12">
                    <rect
                      width="11.1562"
                      height="11.1562"
                      fill="white"
                      transform="translate(3.99121 3.99121)"
                    />
                  </clipPath>
                </defs>
              </svg>
              <Countdown endDate={endDate} />
            </div>
          )}
        </div>

        {/* Content - flex column с gap */}
        <div className="flex flex-col gap-[20px] flex-1">
          {/* Title */}
          <h3 className="font-gilroy text-[32px] font-semibold leading-[1.193] tracking-[-0.01em] text-[#191E35]">
            {data.title}
          </h3>

          {/* Futures list (repeater field) - gap между элементами 15px */}
          {futures.length > 0 && (
            <div className="flex flex-col gap-[15px]">
              {futures.map((future, idx) => (
                <div key={idx} className="flex items-start gap-[10px]">
                  {/* Checkmark icon */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="flex-shrink-0 mt-1"
                  >
                    <circle cx="10" cy="10" r="9" fill="#526AC2" />
                    <path
                      d="M6 10l3 3 5-6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <Text
                    variant="action-card-feature"
                    className="text-[#191E35] flex-1"
                  >
                    {future.text}
                  </Text>
                </div>
              ))}
            </div>
          )}

          {/* Price - между futures и button */}
          {displayPrice && (
            <Text
              variant="action-card-price"
              className="text-[#191E35] font-gilroy text-[28px] font-semibold leading-[1.4]"
            >
              {displayPrice}
            </Text>
          )}

          {/* Button - отступ 18px от цены (согласно Figma) */}
          <div className="mt-[18px]">
            <Link href={data.uri}>
              <button className="w-[172px] min-h-[44px] py-4 rounded-[15px] border border-[#526AC2] bg-transparent hover:bg-[#526AC2] transition-colors flex items-center justify-center group">
                <span className="font-gilroy text-[16px] font-semibold leading-[1.193] tracking-[-0.01em] text-[#526AC2] group-hover:text-white transition-colors">
                  Подробнее
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
