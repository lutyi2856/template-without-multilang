/**
 * Icons Registry для Service Categories
 *
 * Маппинг ACF category_icon slugs на React компоненты.
 * Использует существующий icon-map.ts для получения иконок.
 *
 * @example
 * import { getIconComponent } from '@/lib/icons-registry';
 * const Icon = getIconComponent('tooth');
 * if (Icon) <Icon className="w-16 h-16" />
 */

import type { FC, SVGProps } from "react";
import { getIcon } from "@/icons/icon-map";

type IconComponent = FC<SVGProps<SVGSVGElement>>;

/**
 * Получить React компонент иконки по slug из ACF
 *
 * Поддерживаемые slugs (из wp-content/mu-plugins/unident-svg-icons.php):
 * - tooth, implant, orthodontics, surgery, hygiene, children, aesthetic, diagnostic
 * - whitening, prosthetics, periodontics, endodontics
 * - star, arrow-up-right, percent, ruble, installment и др.
 *
 * @param slug - slug иконки из ACF поля category_icon
 * @returns React компонент иконки или null
 */
export function getIconComponent(
  slug: string | null | undefined
): IconComponent | null {
  if (!slug) return null;
  return getIcon(slug);
}
