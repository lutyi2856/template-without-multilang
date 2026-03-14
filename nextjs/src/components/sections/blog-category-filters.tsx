"use client";

import React, { useState, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PostCategory } from "@/lib/wordpress/api";

const INITIAL_CATEGORY_COUNT = 8;
const EXPAND_STEP = 5;

interface BlogCategoryFiltersProps {
  categories: PostCategory[];
}

const chipBase =
  "px-4 py-3 rounded-[15px] text-sm font-medium transition-colors shrink-0 min-h-[48px]";
const chipActive = "bg-unident-primary text-white";
const chipInactive =
  "bg-unident-bgTopbar text-unident-dark hover:bg-unident-bgElements";
const chipAction = "bg-unident-primary/80 text-white hover:bg-unident-primary";

/**
 * Фильтры архива блога: категории (стандартная WordPress category)
 * Figma: gap 15px, кнопки 154×48 / 186×48px, borderRadius 15px
 */
export function BlogCategoryFilters({
  categories,
}: BlogCategoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [visibleCount, setVisibleCount] = useState(INITIAL_CATEGORY_COUNT);
  const [expanded, setExpanded] = useState(false);

  const category = searchParams.get("category");

  const updateFilter = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("blog-scroll-y", String(window.scrollY));
    }
    startTransition(() => {
      router.push(target, { scroll: false });
    });
  };

  const visibleCategories = expanded
    ? categories
    : categories.slice(0, visibleCount);
  const hasMore = !expanded && categories.length > visibleCount;
  const remainingCount = categories.length - visibleCount;

  return (
    <div className="flex flex-wrap items-center gap-[15px]">
      <button
        type="button"
        onClick={() => updateFilter(null)}
        className={cn(chipBase, !category ? chipActive : chipInactive)}
      >
        Все статьи
      </button>
      {visibleCategories.map((cat) => (
        <button
          key={cat.slug}
          type="button"
          onClick={() => updateFilter(cat.slug)}
          className={cn(chipBase, category === cat.slug ? chipActive : chipInactive)}
        >
          {cat.name}
        </button>
      ))}
      {hasMore && (
        <>
          <button
            type="button"
            onClick={() =>
              setVisibleCount((c) => Math.min(c + EXPAND_STEP, categories.length))
            }
            className={cn(chipBase, chipAction)}
          >
            +{Math.min(EXPAND_STEP, remainingCount)}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={cn(chipBase, chipInactive)}
          >
            Показать всё
          </button>
        </>
      )}
    </div>
  );
}
