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
import { getReviewWord } from "@/lib/wordpress/utils/review-plural";
import type { ReviewsRatingFilter } from "@/lib/wordpress";
import type { ReviewPlatform } from "@/lib/wordpress";

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={13}
      viewBox="0 0 14 13"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M6.66867 0.190085C6.75804 -0.0633587 7.11647 -0.0633582 7.20585 0.190085L8.66178 4.31856C8.70195 4.43246 8.8096 4.50864 8.93037 4.50864H13.589C13.8705 4.50864 13.9813 4.87352 13.7474 5.03012L10.0197 7.52541C9.91165 7.59776 9.86632 7.73414 9.90957 7.8568L11.3427 11.9206C11.4338 12.1789 11.1433 12.4043 10.9157 12.252L7.09568 9.69486C6.99981 9.63069 6.8747 9.63069 6.77883 9.69486L2.95884 12.252C2.7312 12.4043 2.44072 12.1789 2.53182 11.9206L3.96494 7.8568C4.00819 7.73414 3.96286 7.59776 3.85477 7.52541L0.127098 5.03012C-0.106837 4.87352 0.004017 4.50864 0.285526 4.50864H4.94414C5.06491 4.50864 5.17256 4.43246 5.21273 4.31856L6.66867 0.190085Z" />
    </svg>
  );
}

const chipBase =
  "px-4 py-2 rounded-[15px] text-sm font-medium transition-colors shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-[5px]";
const chipActive = "bg-unident-primary text-white";
const chipInactive =
  "bg-unident-bgTopbar text-unident-dark hover:bg-unident-bgElements";

/** Отображаемое имя платформы: 2GIS → 2ГИС (русские буквы) */
function getPlatformDisplayName(name: string): string {
  if (name === "2GIS") return "2ГИС";
  return name;
}

const RATING_OPTIONS: Array<{
  value: undefined | ReviewsRatingFilter;
  label: string;
  showStar: boolean;
}> = [
  { value: undefined, label: "Все отзывы", showStar: false },
  { value: "above_49", label: "Выше 4.9", showStar: true },
  { value: "below_4", label: "Ниже 4", showStar: true },
];

interface ReviewsFiltersProps {
  platforms: ReviewPlatform[];
  /** Количество отзывов (для отображения в активных чипах на mobile) */
  reviewsCount?: number | null;
}

/**
 * Фильтры архива отзывов: рейтинг и платформа (Figma 440:4237, 440:4244).
 * Desktop: два ряда чипов. Mobile: кнопка «Фильтры» + Sheet.
 */
export function ReviewsFilters({
  platforms,
  reviewsCount,
}: ReviewsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentRating = searchParams.get("rating") as
    | ReviewsRatingFilter
    | undefined;
  const activeRating =
    currentRating === "above_49" || currentRating === "below_4"
      ? currentRating
      : undefined;
  const platform = searchParams.get("platform");

  const showPlatformFilter = platforms.length > 1;
  const hasActiveFilters =
    Boolean(activeRating) || (showPlatformFilter && Boolean(platform));

  const updateFilters = (updates: {
    rating?: undefined | ReviewsRatingFilter;
    platform?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.rating !== undefined) {
      if (updates.rating) params.set("rating", updates.rating);
      else params.delete("rating");
    }
    if (updates.platform !== undefined) {
      if (updates.platform) params.set("platform", updates.platform);
      else params.delete("platform");
    }
    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("reviews-scroll-y", String(window.scrollY));
    }
    startTransition(() => {
      router.push(target, { scroll: false });
    });
    setSheetOpen(false);
  };

  const handleRating = (value: undefined | ReviewsRatingFilter) => () => {
    updateFilters({ rating: value, platform: platform ?? undefined });
  };

  const handlePlatform = (slug: string | null) => () => {
    updateFilters({ platform: slug, rating: activeRating ?? undefined });
  };

  const handleReset = () => {
    updateFilters({
      rating: undefined,
      platform: showPlatformFilter ? null : undefined,
    });
  };

  const activePlatform =
    showPlatformFilter && platform
      ? platforms.find((p) => p.slug === platform)
      : null;
  const activePlatformName = activePlatform
    ? getPlatformDisplayName(activePlatform.name)
    : undefined;

  const FiltersContent = ({ withHeaders = false }: { withHeaders?: boolean }) => (
    <>
      {/* Ряд 1: Рейтинг */}
      <div className="relative">
        {withHeaders && (
          <h3 className="text-sm font-semibold text-unident-dark mb-3">
            Рейтинг
          </h3>
        )}
        <div
          className={cn(
            withHeaders
              ? "flex flex-col gap-5"
              : "flex flex-wrap items-start gap-2"
          )}
        >
          {RATING_OPTIONS.map(({ value, label, showStar }) => {
            const isActive =
              activeRating === value || (value === undefined && !activeRating);
            return (
              <button
                key={value ?? "all"}
                type="button"
                onClick={handleRating(value)}
                className={cn(
                  chipBase,
                  isActive ? chipActive : chipInactive,
                  withHeaders && "w-full"
                )}
              >
                <span>{label}</span>
                {showStar && (
                  <StarIcon className="w-[14px] h-[13px] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ряд 2: Платформа */}
      {showPlatformFilter && (
        <div className={cn(withHeaders && "space-y-3")}>
          {withHeaders && (
            <h3 className="text-sm font-semibold text-unident-dark">
              Платформа
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
              onClick={handlePlatform(null)}
              className={cn(
                chipBase,
                !platform ? chipActive : chipInactive,
                withHeaders && "w-full"
              )}
            >
              Все платформы
            </button>
            <div
              className={cn(
                "flex flex-wrap items-center gap-2",
                withHeaders ? "w-full" : "flex-1 min-w-0"
              )}
            >
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={handlePlatform(p.slug)}
                  className={cn(
                    chipBase,
                    platform === p.slug ? chipActive : chipInactive
                  )}
                >
                  {getPlatformDisplayName(p.name)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Кнопка сброса */}
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

      {/* Desktop (lg+): два ряда чипов */}
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
                  {(activeRating ? 1 : 0) +
                    (platform && showPlatformFilter ? 1 : 0)}
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

        {/* Активные фильтры — чипы под кнопкой (mobile) */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeRating && (
              <span className={cn(chipBase, chipActive)}>
                {RATING_OPTIONS.find((o) => o.value === activeRating)?.label}
                {reviewsCount != null
                  ? ` ${reviewsCount} ${getReviewWord(reviewsCount)}`
                  : ""}
              </span>
            )}
            {activePlatformName && (
              <span className={cn(chipBase, chipActive)}>
                {reviewsCount != null
                  ? `${activePlatformName} ${reviewsCount} ${getReviewWord(reviewsCount)}`
                  : activePlatformName}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
