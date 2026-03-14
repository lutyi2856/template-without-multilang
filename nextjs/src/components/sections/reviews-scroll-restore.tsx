"use client";

import { useLayoutEffect } from "react";

/**
 * Восстанавливает позицию скролла после смены фильтра на странице отзывов.
 * ReviewsFilters сохраняет scrollY в sessionStorage при updateFilter;
 * этот компонент восстанавливает его при монтировании с новым filterKey.
 */
export function ReviewsScrollRestore({ filterKey }: { filterKey: string }) {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("reviews-scroll-y");
    if (saved !== null) {
      sessionStorage.removeItem("reviews-scroll-y");
      const y = Number(saved);
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(y, Math.max(0, maxScroll)));
    }
  }, [filterKey]);

  return null;
}
