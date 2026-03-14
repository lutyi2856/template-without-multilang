/**
 * DynamicIcon - рендерит иконку по имени из WordPress ACF
 *
 * Приоритет рендеринга:
 * 1. iconMap (встроенные React SVG-компоненты) — zero overhead
 * 2. svgMarkup (inline SVG из GraphQL для пользовательских иконок из Media Library)
 * 3. fallback
 *
 * @example
 * // Встроенная иконка (из iconMap)
 * <DynamicIcon name="telegram" className="w-6 h-6" />
 *
 * // Пользовательская иконка (из Media Library через GraphQL iconSvg)
 * <DynamicIcon name="media-42" svgMarkup={data.iconSvg} className="w-6 h-6" />
 */

import type { SVGProps, ReactNode } from "react";
import { getIcon } from "@/icons";

export interface DynamicIconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  /** Имя иконки из WordPress ACF (например: 'telegram', 'tooth', 'media-42') */
  name: string | null | undefined;
  /** Inline SVG markup from GraphQL iconSvg field (for custom Media Library icons) */
  svgMarkup?: string | null;
  /** Fallback если иконка не найдена */
  fallback?: ReactNode;
}

export function DynamicIcon({
  name,
  svgMarkup,
  fallback = null,
  className,
  ...props
}: DynamicIconProps) {
  const Icon = getIcon(name);

  if (Icon) {
    return <Icon className={className} {...props} />;
  }

  if (svgMarkup) {
    return (
      <span
        className={`inline-flex shrink-0 [&_svg]:h-full [&_svg]:w-auto [&_svg]:block ${className ?? ""}`}
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
        role="img"
        aria-hidden="true"
      />
    );
  }

  return <>{fallback}</>;
}

export default DynamicIcon;
