/**
 * InfoBlock - универсальный блок с иконкой + текст + подпись
 * 
 * REFACTORED: Использует Design System компоненты
 * - bg-unident-* вместо хардкод цветов
 * - text-unident-* вместо хардкод цветов
 * 
 * Используется для отображения информационных блоков в header:
 * - Клиники (локация + "Схема проезда")
 * - Телефон (номер + часы работы)
 * - Часы работы (Пн-Сб / Вс)
 * 
 * PERFORMANCE: Server Component (статичный контент)
 * 
 * @example
 * <InfoBlock
 *   icon={<Icon icon="bx:map-pin" />}
 *   title="3 клиники рядом с метро"
 *   subtitle="Схема проезда"
 *   href="/locations"
 * />
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { typography } from '@/design-tokens/typography';

export interface InfoBlockProps {
  /** SVG иконка или React элемент */
  icon: ReactNode;
  /** Основной текст (может быть строкой или React элементом) */
  title: string | ReactNode;
  /** Дополнительный текст (опционально) */
  subtitle?: string | ReactNode;
  /** Ссылка (опционально) */
  href?: string;
  /** Обработчик клика (опционально) */
  onClick?: () => void;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * InfoBlock Component
 * 
 * Стили из Figma:
 * - Gap 11px между иконкой и текстом
 * - Иконка: 38x38px, border #F5F7F9, radius 52px
 * - Title: 18px Gilroy Medium (#191E35)
 * - Subtitle: 14px Gilroy Medium (rgba(20,41,78,0.35))
 */
export function InfoBlock({
  icon,
  title,
  subtitle,
  href,
  onClick,
  className = '',
}: InfoBlockProps) {
  // Контент блока
  const content = (
    <div className={`flex items-center gap-[11px] ${className}`}>
      {/* Иконка в круглом контейнере */}
      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[52px] border border-unident-bgElements bg-white">
        {icon}
      </div>

      {/* Текст */}
      <div className="flex flex-col gap-[2px]">
        {/* Основной текст — fluid typography */}
        <div className={`font-gilroy text-unident-dark ${typography.figma['header-info-title']}`}>
          {title}
        </div>

        {/* Подпись (если есть) — fluid typography */}
        {subtitle && (
          <div className={`font-gilroy text-unident-textGray opacity-35 ${typography.figma['header-info-subtitle']}`}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  // Если есть ссылка - обернуть в Link
  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="transition-opacity hover:opacity-80"
      >
        {content}
      </Link>
    );
  }

  // Если есть обработчик клика - обернуть в button
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="transition-opacity hover:opacity-80"
      >
        {content}
      </button>
    );
  }

  // Иначе просто div
  return <div>{content}</div>;
}
