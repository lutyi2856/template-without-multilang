"use client";

import React, { useState, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/design-system";
import { getPromotionWord } from "@/lib/utils/promotion-plural";
import type { PromotionServiceCategory } from "@/lib/wordpress/api";

const INITIAL_CATEGORY_COUNT = 5;
const EXPAND_STEP = 5;

const chipBase =
  "px-4 py-2 rounded-[15px] text-sm font-medium transition-colors shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center";
const chipActive = "bg-unident-primary text-white";
const chipInactive =
  "bg-unident-bgTopbar text-unident-dark hover:bg-unident-bgElements";
const chipAction = "bg-[#607BD4] text-white hover:bg-unident-primary";

interface PromotionsFiltersProps {
  categories: PromotionServiceCategory[];
  promotionsCount?: number;
}

/**
 * Фильтры архива акций: категории (service_categories).
 * Показываются только категории, у которых есть акции.
 * Фильтр скрыт, если вариантов 1 или меньше.
 * Desktop: чипы (flex-wrap). Mobile: кнопка «Фильтры» + Sheet.
 */
export function PromotionsFilters({
  categories,
  promotionsCount,
}: PromotionsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const [visibleCategoryCount, setVisibleCategoryCount] = useState(
    INITIAL_CATEGORY_COUNT
  );
  const [expanded, setExpanded] = useState(false);

  const category = searchParams.get("category");

  const showCategoryFilter = categories.length > 1;

  const updateFilters = (updates: { category?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.category !== undefined) {
      if (updates.category) params.set("category", updates.category);
      else params.delete("category");
    }
    params.delete("page");
    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("promotions-scroll-y", String(window.scrollY));
    }
    startTransition(() => {
      router.push(target, { scroll: false });
    });
    setSheetOpen(false);
  };

  const visibleCategories = expanded
    ? categories
    : categories.slice(0, visibleCategoryCount);
  const hasMoreCategories =
    !expanded && categories.length > visibleCategoryCount;
  const remainingCount = categories.length - visibleCategoryCount;

  const handleCategory = (slug: string | null) => () => {
    updateFilters({ category: slug });
  };

  const handleReset = () => {
    updateFilters({ category: null });
  };

  const hasActiveFilters = Boolean(category);

  const activeCategoryName =
    showCategoryFilter &&
    category &&
    categories.find((c) => c.slug === category)?.name;

  if (!showCategoryFilter) return null;

  const FiltersContent = ({ withHeaders = false }: { withHeaders?: boolean }) => (
    <div className="relative">
      {withHeaders && (
        <h3 className="text-sm font-semibold text-unident-dark mb-3">
          Категория
        </h3>
      )}
      <div
        className={cn(
          withHeaders
            ? "flex flex-col gap-5"
            : "flex flex-wrap items-start gap-2"
        )}
      >
        <button
          type="button"
          onClick={handleCategory(null)}
          className={cn(
            chipBase,
            !category ? chipActive : chipInactive,
            withHeaders && "w-full"
          )}
        >
          Все акции
        </button>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            withHeaders ? "w-full" : "flex-1 min-w-0"
          )}
        >
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={handleCategory(cat.slug)}
              className={cn(
                chipBase,
                category === cat.slug ? chipActive : chipInactive
              )}
            >
              {cat.name}
            </button>
          ))}
          {hasMoreCategories && (
            <>
              <button
                type="button"
                onClick={() =>
                  setVisibleCategoryCount((c) =>
                    Math.min(c + EXPAND_STEP, categories.length)
                  )
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
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Кнопка сброса — выше фильтров */}
      <div className="relative min-h-[2.5rem]">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute left-0 top-0 text-sm text-unident-primary hover:underline font-medium min-h-[44px] min-w-[44px] inline-flex items-center"
            aria-label="Сбросить фильтр"
          >
            Сбросить фильтр
          </button>
        )}
      </div>

      {/* Desktop (lg+): чипы */}
      <div className="hidden lg:block space-y-6">
        <FiltersContent />
      </div>

      {/* Mobile (max-lg): кнопка «Фильтры» + Sheet */}
      <div className="lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              unidentVariant="outline"
              className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2"
              aria-label="Открыть фильтры"
            >
              <Filter className="h-4 w-4 shrink-0" aria-hidden />
              <span>Фильтры</span>
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-unident-primary px-1.5 text-xs font-medium text-white">
                  1
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full max-w-sm overflow-y-auto"
            aria-describedby={undefined}
          >
            <SheetHeader>
              <SheetTitle>Фильтры</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-8">
              <FiltersContent withHeaders />
            </div>
          </SheetContent>
        </Sheet>

        {/* Активные фильтры — чипы над контентом (mobile) */}
        {hasActiveFilters && activeCategoryName && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={cn(chipBase, chipActive)}>
              {promotionsCount != null
                ? `${activeCategoryName} ${promotionsCount} ${getPromotionWord(promotionsCount)}`
                : activeCategoryName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
