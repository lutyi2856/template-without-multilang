/**
 * NavItem - элемент навигации (простая ссылка)
 */

"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/components/dynamic-icon";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { NavItemProps } from "./types";

export function NavItem({ className, item }: NavItemProps) {
  // Определяем стили badge в зависимости от варианта
  const badgeStyles =
    item.badgeVariant === "count"
      ? "bg-transparent text-unident-dark hover:bg-transparent" // Для отзывов (без фона)
      : "bg-unident-primary text-white hover:bg-unident-primary"; // Для акций (с синим фоном)

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "relative flex items-center gap-2 font-gilroy text-unident-dark transition-colors hover:text-unident-primary",
        typography.figma["nav-link"],
        className
      )}
    >
      {/* Icon from WordPress - rendered from icon name */}
      {item.icon && <DynamicIcon name={item.icon} svgMarkup={item.iconSvg} className="h-5 w-5" />}

      <span className="whitespace-nowrap">{item.label}</span>

      {/* Badge универсальный (с фоном или без) */}
      {item.badge && (
        <Badge
          className={`h-auto min-w-[20px] rounded-[7.6px] px-[6px] py-[2px] text-[9.18px] font-medium ${badgeStyles}`}
        >
          {item.badge}
        </Badge>
      )}

      {/* Discount badge */}
      {item.discount && (
        <Badge
          variant="outline"
          className="h-auto rounded-[7.6px] border-unident-primary px-[6px] py-[2px] text-[12px] font-medium text-unident-primary"
        >
          {item.discount}
        </Badge>
      )}
    </Link>
  );
}
