/**
 * ServiceCard - карточка категории услуги
 *
 * Компонент для отображения карточки категории услуги на главной странице.
 * Дизайн из Figma: node 93:697 (services_block)
 *
 * PERFORMANCE: Server Component (без 'use client')
 *
 * @example
 * <ServiceCard
 *   name="Имплантация"
 *   slug="implant"
 *   iconSlug="implant"
 * />
 */

import Link from "next/link";
import { Card, Text } from "@/components/design-system";
import { DynamicIcon } from "@/components/dynamic-icon";

interface ServiceCardProps {
  /** Название категории услуги */
  name: string;

  /** Slug категории для ссылки */
  slug: string;

  /** Slug иконки из ACF (category_icon) */
  iconSlug?: string | null;

  /** Inline SVG markup для иконок из Media Library */
  iconSvg?: string | null;

  /** Фон карточки: white — главная, gray — страница услуги */
  variant?: "white" | "gray";

  /** Базовый путь для ссылки: /services (по умолчанию) или /service-category для категорий */
  basePath?: string;

  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Карточка категории услуги
 *
 * Структура:
 * - Стрелка (inline SVG) - правый верхний угол
 * - Название категории - верхний левый угол
 * - Иконка услуги - нижний левый угол
 *
 * Hover: shadow-xl + стрелка двигается вправо-вверх
 */
export function ServiceCard({
  name,
  slug,
  iconSlug,
  iconSvg,
  variant = "gray",
  basePath = "/services",
  className = "",
}: ServiceCardProps) {
  const hasIcon = iconSlug || iconSvg;
  const bgClass = variant === "white" ? "bg-white" : "bg-unident-bgElements";

  return (
    <Link href={`${basePath}/${slug}`} className={`group block ${className}`}>
      <Card
        variant="default"
        className={`relative h-full min-h-[134px] md:min-h-[154px] ${bgClass} p-[20px] md:pt-[19px] md:pr-[20px] md:pb-[23px] md:pl-[20px] transition-all duration-300 hover:shadow-xl rounded-[25px]`}
      >
        {/* Стрелка (service-arrow.svg inline) - правый верхний угол */}
        {/* Размер стрелки: 20.5px из Figma */}
        <div className="absolute top-8 right-8">
          <div className="w-[32px] h-[32px] rounded-[8px] bg-white flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            {/* Inline SVG - zero HTTP requests, размер 20.5px */}
            <svg
              width="20.5"
              height="20.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-unident-primary"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Название категории - верхний левый угол */}
        <div className="relative z-10 max-w-[calc(100%-80px)]">
          <Text variant="service-title" className="text-unident-dark">
            {name}
          </Text>
        </div>

        {/* Иконка услуги - нижний угол с точными отступами из Figma */}
        {/* Снизу: 15px, Слева: 23px */}
        <div className="absolute bottom-[15px] left-[23px]">
          {hasIcon && (
            <DynamicIcon
              name={iconSlug ?? undefined}
              svgMarkup={iconSvg}
              className="w-[32px] h-[32px] text-unident-primary opacity-80"
            />
          )}
        </div>
      </Card>
    </Link>
  );
}
