"use client";

/**
 * PriceSectionWithNav - секция цен с навигацией по категориям
 *
 * Figma node 405:3701: таблица + nav + кнопка "Скачать прайс-лист".
 * Правая колонка: nav (fills '7') + кнопка с иконкой (fills '3').
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "@/components/design-system";
import { cn } from "@/lib/utils";
import { PriceTable, type CategoryWithServices } from "./price-table";

function PriceDownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      width={19}
      height={19}
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M9.3903 12.1882C9.28596 12.1882 9.18814 12.1721 9.09684 12.1397C9.00554 12.1074 8.92077 12.0518 8.84251 11.973L6.02533 9.15584C5.86881 8.99933 5.79369 8.81674 5.79995 8.60806C5.80621 8.39937 5.88134 8.21678 6.02533 8.06027C6.18184 7.90376 6.36782 7.82237 6.58329 7.81611C6.79875 7.80985 6.98447 7.88472 7.14046 8.0407L8.60775 9.50799V3.91274C8.60775 3.69102 8.68287 3.50529 8.83312 3.35557C8.98337 3.20584 9.1691 3.13071 9.3903 3.13019C9.6115 3.12967 9.79749 3.20479 9.94826 3.35557C10.099 3.50634 10.1739 3.69206 10.1729 3.91274V9.50799L11.6401 8.0407C11.7966 7.88419 11.9826 7.80907 12.1981 7.81533C12.4136 7.82159 12.5993 7.90324 12.7553 8.06027C12.8987 8.21678 12.9739 8.39937 12.9806 8.60806C12.9874 8.81674 12.9123 8.99933 12.7553 9.15584L9.93809 11.973C9.85983 12.0513 9.77505 12.1068 9.68376 12.1397C9.59246 12.1726 9.49464 12.1888 9.3903 12.1882ZM4.69499 15.651C4.26458 15.651 3.89626 15.4979 3.59002 15.1917C3.28378 14.8854 3.1304 14.5168 3.12988 14.0859V12.5208C3.12988 12.2991 3.20501 12.1134 3.35526 11.9636C3.50551 11.8139 3.69123 11.7388 3.91243 11.7383C4.13364 11.7377 4.31962 11.8129 4.47039 11.9636C4.62117 12.1144 4.69603 12.3001 4.69499 12.5208V14.0859H14.0856V12.5208C14.0856 12.2991 14.1607 12.1134 14.311 11.9636C14.4612 11.8139 14.647 11.7388 14.8682 11.7383C15.0894 11.7377 15.2754 11.8129 15.4261 11.9636C15.5769 12.1144 15.6518 12.3001 15.6507 12.5208V14.0859C15.6507 14.5163 15.4976 14.8849 15.1914 15.1917C14.8851 15.4984 14.5165 15.6515 14.0856 15.651H4.69499Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface PriceSectionWithNavProps {
  categories: CategoryWithServices[];
  /** URL PDF прайс-листа — показывается кнопка «Скачать прайс-лист» под nav */
  priceListPdfUrl?: string | null;
  /** Показывать колонку «Средняя в городе». По умолчанию true. */
  showAverageInCity?: boolean;
  className?: string;
}

export function PriceSectionWithNav({
  categories,
  priceListPdfUrl = null,
  showAverageInCity = true,
  className = "",
}: PriceSectionWithNavProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const slugs = categories.map((c) => c.slug || c.id).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id;
          if (id) setActiveSlug(id);
        }
      },
      {
        root: container,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    slugs.forEach((slug) => {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = useCallback((slug: string) => {
    setActiveSlug(slug);
    const container = scrollRef.current;
    const el = document.getElementById(slug);
    if (!container || !el) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scrollTop =
      container.scrollTop + (elRect.top - containerRect.top);
    container.scrollTo({
      top: Math.max(0, scrollTop - 16),
      behavior: "smooth",
    });
  }, []);

  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_418px] gap-[60px]",
        className
      )}
    >
      {/* Левая колонка: mobile — заголовки скроллятся с таблицей, desktop — фиксированы */}
      <div className="flex min-w-0 flex-col">
        {/* Mobile: overflow-x-auto чтобы заголовки скроллились вместе с таблицей */}
        <div className="max-md:overflow-x-auto">
          <div className="max-md:min-w-[400px] max-sm:min-w-[520px]">
            {/* Заголовки таблицы */}
            <div
              className={cn(
                "grid shrink-0 gap-x-4 max-sm:px-[25px] sm:px-4 mb-6",
                showAverageInCity
                  ? "grid-cols-[1.8fr_1.1fr_1fr] sm:grid-cols-[2fr_0.72fr_0.38fr] md:grid-cols-[1fr_1.8fr_0.72fr_0.38fr]"
                  : "grid-cols-[1.8fr_2.1fr] sm:grid-cols-[2fr_1.1fr] md:grid-cols-[1fr_1.8fr_1.1fr]"
              )}
            >
              <div className="hidden md:block" />
              <Text
                variant="price-table-header"
                className="text-unident-dark opacity-30"
              >
                Услуга
              </Text>
              <Text
                variant="price-table-header"
                className={
                  showAverageInCity
                    ? "text-unident-dark opacity-30 text-right border-r border-dashed border-unident-borderGray pr-4"
                    : "text-unident-dark opacity-30 text-right"
                }
              >
                Наша цена
              </Text>
              {showAverageInCity && (
                <Text
                  variant="price-table-header"
                  className="text-unident-dark opacity-30 text-right"
                >
                  Средняя в городе
                </Text>
              )}
            </div>
            {/* Scroll только по категориям цен — плавная прокрутка */}
            <div
              ref={scrollRef}
              className="price-table-scroll overflow-y-auto scroll-smooth"
              style={{ height: 837, maxHeight: "min(837px, 70vh)" }}
            >
              <PriceTable
                categories={categories}
                hideHeader
                hideAllPricesButton
                useCategoryAnchors
                showAverageInCity={showAverageInCity}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Правая колонка — nav + кнопка по Figma 405:3701: gap 15px */}
      <div className="flex flex-col gap-4 self-start shrink-0 lg:sticky lg:top-24">
        <nav
          className="relative shrink-0 overflow-hidden rounded-[25px] bg-unident-bgLightGray p-5"
          aria-label="Навигация по категориям цен"
        >
          {/* Vertical line (Vector 32) - Figma: x 35.49, h 370, stroke #191E35 */}
          <div
            className="absolute left-9 top-9 bottom-9 w-px bg-unident-dark"
            aria-hidden
          />
          <ul
            className={cn(
              "relative z-10 flex max-h-[400px] flex-col gap-[15px] overflow-y-auto",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            {categories.map((category) => {
            const slug = category.slug || category.id;
            const isActive = activeSlug === slug;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => scrollToCategory(slug)}
                  className={cn(
                    "flex w-full flex-row items-center gap-[30px] rounded-[10px] px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "bg-unident-white text-unident-primary"
                      : "text-unident-dark hover:bg-unident-bgElements hover:text-unident-primary"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      isActive ? "bg-unident-primary" : "bg-unident-dark"
                    )}
                    aria-hidden
                  />
                  <Text
                    variant="price-service-name"
                    as="span"
                    className="text-[18px] font-medium leading-[1.3]"
                  >
                    {category.name}
                  </Text>
                </button>
              </li>
            );
          })}
          </ul>
        </nav>

        {/* Кнопка «Прайс-лист» — Figma 405:3719, видна только если PDF загружен */}
        {priceListPdfUrl && (
          <a
            href={priceListPdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[15px] bg-unident-primary px-6 py-3 font-gilroy font-semibold text-white transition-colors hover:bg-unident-primaryLight"
          >
            <PriceDownloadIcon className="shrink-0 text-white" />
            <span>Прайс-лист</span>
          </a>
        )}
      </div>
    </div>
  );
}
