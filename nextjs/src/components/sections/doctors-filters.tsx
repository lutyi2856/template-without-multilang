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
import { getDoctorWord } from "@/lib/utils/doctor-plural";
import type { DoctorServiceCategory } from "@/lib/wordpress/api";
import type { Clinic } from "@/lib/wordpress/api";

const INITIAL_CATEGORY_COUNT = 5;
const EXPAND_STEP = 5;

const chipBase =
  "px-4 py-2 rounded-[15px] text-sm font-medium transition-colors shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center";
const chipActive = "bg-unident-primary text-white";
const chipInactive =
  "bg-unident-bgTopbar text-unident-dark hover:bg-unident-bgElements";
const chipAction = "bg-[#607BD4] text-white hover:bg-unident-primary";

interface DoctorsFiltersProps {
  categories: DoctorServiceCategory[];
  clinics: Clinic[];
  /** Количество врачей (для отображения в активных чипах на mobile) */
  doctorsCount?: number | null;
}

/**
 * Фильтры архива врачей: категории (service_categories) и клиники.
 * Показываются только категории и клиники, у которых есть врачи.
 * Фильтр скрыт, если вариантов 1 или меньше (нет смысла выбирать).
 * Desktop: чипы (flex-wrap). Mobile: кнопка «Фильтры» + Sheet.
 */
export function DoctorsFilters({
  categories,
  clinics,
  doctorsCount,
}: DoctorsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const [visibleCategoryCount, setVisibleCategoryCount] =
    useState(INITIAL_CATEGORY_COUNT);
  const [expanded, setExpanded] = useState(false);

  const category = searchParams.get("category");
  const clinic = searchParams.get("clinic");

  const showCategoryFilter = categories.length > 1;
  const showClinicFilter = clinics.length > 1;
  const hasAnyFilter = showCategoryFilter || showClinicFilter;

  const updateFilters = (updates: {
    category?: string | null;
    clinic?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.category !== undefined) {
      if (updates.category) params.set("category", updates.category);
      else params.delete("category");
    }
    if (updates.clinic !== undefined) {
      if (updates.clinic) params.set("clinic", updates.clinic);
      else params.delete("clinic");
    }
    params.delete("page");
    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("doctors-scroll-y", String(window.scrollY));
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
    updateFilters({ category: slug, clinic: clinic ?? undefined });
  };

  const handleClinic = (slug: string | null) => () => {
    updateFilters({ clinic: slug, category: category ?? undefined });
  };

  const handleReset = () => {
    updateFilters({
      category: showCategoryFilter ? null : undefined,
      clinic: showClinicFilter ? null : undefined,
    });
  };

  const hasActiveFilters =
    (showCategoryFilter && Boolean(category)) ||
    (showClinicFilter && Boolean(clinic));

  const activeCategoryName =
    showCategoryFilter &&
    category &&
    categories.find((c) => c.slug === category)?.name;
  const activeClinicName =
    showClinicFilter && clinic && clinics.find((c) => c.slug === clinic)?.title;

  if (!hasAnyFilter) return null;

  const FiltersContent = ({ withHeaders = false }: { withHeaders?: boolean }) => (
    <>
      {showCategoryFilter && (
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
              Все врачи
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
      )}

      {showClinicFilter && (
        <div className={cn(withHeaders && "space-y-3")}>
          {withHeaders && (
            <h3 className="text-sm font-semibold text-unident-dark">
              Филиал
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
              onClick={handleClinic(null)}
              className={cn(
                chipBase,
                !clinic ? chipActive : chipInactive,
                withHeaders && "w-full"
              )}
            >
              Все филиалы
            </button>
            <div
              className={cn(
                "flex flex-wrap items-center gap-2",
                withHeaders && "w-full"
              )}
            >
              {clinics.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={handleClinic(c.slug)}
                className={cn(
                  chipBase,
                  clinic === c.slug ? chipActive : chipInactive
                )}
              >
                {c.title}
              </button>
            ))}
            </div>
          </div>
        </div>
      )}
    </>
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

      {/* Desktop (lg+): чипы — без изменений */}
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
                  {(category && showCategoryFilter ? 1 : 0) +
                    (clinic && showClinicFilter ? 1 : 0)}
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
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeCategoryName && (
              <span className={cn(chipBase, chipActive)}>
                {doctorsCount != null
                  ? `${activeCategoryName} ${doctorsCount} ${getDoctorWord(doctorsCount)}`
                  : activeCategoryName}
              </span>
            )}
            {activeClinicName && (
              <span className={cn(chipBase, chipActive)}>
                {doctorsCount != null
                  ? `${activeClinicName} ${doctorsCount} ${getDoctorWord(doctorsCount)}`
                  : activeClinicName}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
