/**
 * Rating - рейтинг с звездами и источником (точная копия из Figma node 109:116)
 * Структура: текст "5,0" + SVG с звездами и иконками карт + количество отзывов
 * 
 * PERFORMANCE: Server Component (статичный контент)
 */

import Image from 'next/image';
import { typography } from '@/design-tokens/typography';
import type { RatingProps } from './types';

export function Rating({
  className,
  value = 5.0,
  maxValue = 5,
  source = 'Google Карты',
  reviewCount,
  icon,
}: RatingProps) {
  // Форматирование числа с запятой (русский формат)
  const formattedValue = value.toFixed(1).replace('.', ',');

  return (
    <div className={`flex items-center ${className}`}>
      {/* Group 380280 из Figma: 143.46px × 40px */}
      <div className="flex items-center gap-[10px]">
        {/* Текст "5,0" - node 109:132, 48px × 40px */}
        <span className={typography.figma['header-rating-number'] + ' font-gilroy text-unident-dark'}>
          {formattedValue}
        </span>

        {/* Group 49151 (node 109:117) - SVG с звездами и иконками карт, 85.32px × 32.06px */}
        <Image
          src="/images/rating-icons.svg"
          alt="Rating stars and maps"
          width={85}
          height={32}
          className="h-[32px] w-[85px]"
        />
      </div>

      {/* Количество отзывов - не из Figma, но нужно для полноты */}
      {reviewCount && (
        <span className={`ml-1 text-unident-dark ${typography.body.small}`}>
          ({reviewCount.toLocaleString('ru-RU')})
        </span>
      )}
    </div>
  );
}
