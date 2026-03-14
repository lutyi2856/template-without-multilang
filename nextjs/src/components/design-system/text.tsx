/**
 * Text - универсальный компонент для текста с Design Tokens
 *
 * Использует Design Tokens из @/design-tokens/typography
 * для семантических и Figma-специфичных стилей.
 *
 * @example Семантические варианты
 * <Text variant="default">Обычный текст</Text>
 * <Text variant="small">Маленький текст</Text>
 *
 * @example Figma-специфичные варианты
 * <Text variant="doctor-description">Описание врача</Text>
 * <Text variant="clinic-name">Название клиники</Text>
 *
 * @example С разными HTML тегами
 * <Text as="span" variant="clinic-name">Клиника</Text>
 * <Text as="div" variant="doctor-description">Описание</Text>
 */

import { typography, type TypographyVariant } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";

interface TextProps {
  children?: React.ReactNode;
  variant?: TypographyVariant;
  as?: "p" | "span" | "div" | "label" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  dangerouslySetInnerHTML?: { __html: string };
}

export function Text({
  children,
  variant = "default",
  as: Component = "p",
  className,
  dangerouslySetInnerHTML,
}: TextProps) {
  // Автоматически определяем откуда брать стиль
  const getStyles = () => {
    if (variant in typography.body) {
      return typography.body[variant as keyof typeof typography.body];
    }
    if (variant in typography.heading) {
      return typography.heading[variant as keyof typeof typography.heading];
    }
    return typography.figma[variant as keyof typeof typography.figma];
  };

  // Если используется dangerouslySetInnerHTML, не передаем children
  if (dangerouslySetInnerHTML) {
    return (
      <Component
        className={cn("font-gilroy", getStyles(), className)}
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      />
    );
  }

  return (
    <Component className={cn("font-gilroy", getStyles(), className)}>
      {children}
    </Component>
  );
}
