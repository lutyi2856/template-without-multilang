/**
 * SocialLinks - иконки социальных сетей
 *
 * Поддерживает:
 * - Иконки по имени из @/icons (zero HTTP requests)
 * - Кастомные размеры и стили
 *
 * PERFORMANCE: Server Component + SVG components (performance-first philosophy)
 */

import Link from "next/link";
import { DynamicIcon } from "@/components/dynamic-icon";
import type { SocialLink } from "./types";

interface SocialLinksProps {
  links?: SocialLink[];
  className?: string;
  bgColor?: string;
  size?: number;
  /** Default: белый круг, синяя иконка. Hover: синий круг, белая иконка */
  hoverInvert?: boolean;
}

export function SocialLinks({
  links = [],
  className,
  bgColor = "white",
  size = 37,
  hoverInvert = false,
}: SocialLinksProps) {
  const iconSize = Math.round(size * 0.48);

  return (
    <div className={`flex flex-wrap items-center gap-[7px] ${className ?? ""}`}>
      {links.map((link, idx) => {
        if (!link.icon) return null;

        const background = link.bgColor || bgColor;

        return (
          <Link
            key={idx}
            href={link.url}
            aria-label={link.ariaLabel || link.name}
            className={
              hoverInvert
                ? "group relative inline-flex items-center justify-center rounded-full bg-white transition-colors duration-200 hover:!bg-unident-primary"
                : "group relative inline-flex items-center justify-center transition-opacity hover:opacity-70"
            }
            style={{
              width: Math.max(size, 44),
              height: Math.max(size, 44),
              minWidth: 44,
              minHeight: 44,
              ...(hoverInvert ? { borderRadius: "50%" } : { backgroundColor: background, borderRadius: "50%" }),
            }}
          >
            <DynamicIcon
              name={link.icon}
              svgMarkup={link.iconSvg}
              className={
                hoverInvert
                  ? "!text-unident-primary transition-colors duration-200 group-hover:!text-white"
                  : "text-unident-primary"
              }
              style={{ width: iconSize, height: iconSize }}
            />
          </Link>
        );
      })}
    </div>
  );
}
