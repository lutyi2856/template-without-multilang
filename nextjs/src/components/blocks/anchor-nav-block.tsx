"use client";

import { cn } from "@/lib/utils";
import type { AnchorNavBlockAttrs } from "./types";

export function AnchorNavBlock({ items = [], marginBottom = 40 }: AnchorNavBlockAttrs) {
  if (!items.length) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = anchor;
    }
  };

  return (
    <nav
      className="overflow-x-auto"
      style={{ marginBottom: `${marginBottom}px` }}
      aria-label="Навигация по странице"
    >
      <div className="flex flex-wrap gap-2 py-2">
        {items.map((item, idx) => {
          const anchor = item.anchor ?? "";
          const text = item.text ?? "";
          if (!anchor || !text) return null;

          return (
            <a
              key={`${anchor}-${idx}`}
              href={`#${anchor}`}
              onClick={(e) => handleClick(e, anchor)}
              className={cn(
                "inline-block shrink-0 rounded-[10px] bg-unident-bgElements px-4 py-2",
                "text-[14px] font-medium text-unident-dark transition-colors",
                "hover:bg-unident-bgLightBlue focus:outline-none focus:ring-2 focus:ring-unident-primary"
              )}
            >
              {text}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
