/**
 * Heading - универсальный компонент для заголовков с Design Tokens
 *
 * Использует Design Tokens из @/design-tokens/typography
 * для семантических вариантов заголовков.
 *
 * @example Базовое использование
 * <Heading level={1}>Заголовок страницы</Heading>
 * <Heading level={2}>Заголовок секции</Heading>
 * <Heading level={3}>Заголовок карточки</Heading>
 *
 * @example С явным variant
 * <Heading level={3} variant="card-title">Заголовок карточки врача</Heading>
 * <Heading level={2} variant="section-title">Наши услуги</Heading>
 *
 * @example С дополнительными стилями
 * <Heading level={1} variant="page-title" className="mb-8">
 *   Главный заголовок
 * </Heading>
 */

import {
  typography,
  type HeadingVariant,
  type FigmaVariant,
} from "@/design-tokens/typography";
import { cn } from "@/lib/utils";

interface HeadingProps
  extends Omit<
    React.HTMLAttributes<HTMLHeadingElement>,
    "children" | "className"
  > {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: HeadingVariant | FigmaVariant;
  className?: string;
}

// Дефолтные варианты для каждого уровня
const defaultVariantsByLevel: Record<number, HeadingVariant> = {
  1: "page-title",
  2: "section-title",
  3: "card-title",
  4: "subsection",
  5: "subsection",
  6: "subsection",
};

export function Heading({
  children,
  level,
  variant,
  className,
  ...rest
}: HeadingProps) {
  const Component = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const selectedVariant = variant || defaultVariantsByLevel[level];

  // Автоматически определяем откуда брать стиль
  const getStyles = () => {
    if (selectedVariant in typography.heading) {
      return typography.heading[
        selectedVariant as keyof typeof typography.heading
      ];
    }
    return typography.figma[selectedVariant as keyof typeof typography.figma];
  };

  return (
    <Component
      className={cn("font-gilroy", getStyles(), className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
