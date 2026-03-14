'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { getPromotionPrice } from '@/lib/utils/promotion-price';
import type { PromoBlockProps } from '@/types';

/**
 * PromoBlock - компонент промо-блока для топ-бара
 * 
 * Отображает promotion с данными о service и price из WordPress Header Settings
 * Формат: "{Service Title} за {Price}₽/мес"
 * 
 * @example
 * ```tsx
 * <PromoBlock 
 *   promotion={{
 *     title: "Акция на имплантацию",
 *     uri: "/promotions/implantaciya",
 *     relatedServices: {
 *       nodes: [{
 *         title: "Имплантация зубов",
 *         uri: "/services/implantaciya",
 *         relatedPrices: {
 *           nodes: [{
 *             promoPrice: 3750,
 *             currency: "₽",
 *             period: "мес"
 *           }]
 *         }
 *       }]
 *     }
 *   }}
 *   onClose={() => console.log('closed')}
 * />
 * ```
 */
export function PromoBlock({
  promotion,
  className,
  onClose,
}: PromoBlockProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Обработчик закрытия
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    onClose?.();
  };

  // Не отображаем, если закрыто пользователем
  if (!isVisible) {
    return null;
  }

  const service = promotion.promotionRelationships?.relatedServices?.edges?.[0]?.node || null;
  const price = getPromotionPrice(promotion) ?? null;

  const titlePart = service?.title ?? promotion.title;
  const displayPrice = price?.promoPrice ?? price?.regularPrice;
  const currency = price?.currency || '₽';
  const period = price?.period || 'мес';
  const promoText =
    displayPrice != null
      ? `${titlePart} за ${displayPrice}${currency}/${period}`
      : titlePart;

  if (!titlePart && !promoText) {
    return null;
  }

  return (
    <div
      className={cn(
        // Базовые стили
        'flex items-center gap-2',
        'rounded-[25px]',
        'bg-white',
        'px-3 py-2',
        'shadow-sm',
        'transition-all',
        'hover:shadow-md',
        
        className
      )}
    >
      {/* Иконка промо */}
      <Icon 
        icon="fluent:sparkle-28-filled" 
        className="h-5 w-5 flex-shrink-0 text-unident-primary"
        aria-hidden="true"
      />

      <Link
        href={service?.uri || promotion.uri || '/'}
        className={cn(
          'text-sm font-medium',
          'text-unident-dark',
          'hover:text-unident-primary',
          'transition-colors',
          'line-clamp-1'
        )}
        title={promoText}
      >
        {promoText}
      </Link>

      {/* Кнопка закрытия */}
      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          className={cn(
            'ml-1 flex-shrink-0',
            'rounded-full',
            'min-h-[44px] min-w-[44px] flex items-center justify-center',
            'text-gray-400',
            'hover:bg-gray-100',
            'hover:text-gray-600',
            'transition-colors',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-unident-primary',
            'focus:ring-offset-1'
          )}
          aria-label="Закрыть промо"
        >
          <Image
            src="/images/icons/close.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4"
          />
        </button>
      )}
    </div>
  );
}
