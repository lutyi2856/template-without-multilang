/**
 * PriceTable - таблица с ценами на услуги
 *
 * Отображает таблицу с категориями услуг и их ценами.
 * Структура:
 * - Заголовки: [пусто], "Услуга", "Наша цена", "Средняя в городе"
 * - Первая колонка: категории услуг (без заголовка)
 * - Группировка по категориям услуг
 * - Кнопка "Смотреть все цены" внизу
 *
 * Дизайн из Figma: node 93:302
 */

import React from "react";
import { Text, Button } from "@/components/design-system";
import Link from "next/link";
import { getCurrencySymbol } from "@/lib/currency";

interface PriceData {
  id: string;
  regularPrice?: number | null;
  averagePriceCity?: number | null;
  currency?: string | null;
}

interface ServiceWithPrice {
  id: string;
  title: string;
  /** Slug для ссылки на страницу услуги */
  slug?: string;
  /** Краткое описание из WordPress excerpt (HTML stripped) */
  excerpt?: string | null;
  prices: PriceData[];
}

export interface CategoryWithServices {
  id: string;
  name: string;
  slug?: string;
  services: ServiceWithPrice[];
}

interface PriceTableProps {
  categories: CategoryWithServices[];
  className?: string;
  hideHeader?: boolean;
  hideAllPricesButton?: boolean;
  useCategoryAnchors?: boolean;
  /** Показывать колонку «Средняя в городе». По умолчанию true. */
  showAverageInCity?: boolean;
}

export function PriceTable({
  categories,
  className = "",
  hideHeader = false,
  hideAllPricesButton = false,
  useCategoryAnchors = false,
  showAverageInCity = true,
}: PriceTableProps) {
  // Форматирование цены (currency из WordPress: RUB, UZS и т.д.)
  const formatPrice = (price?: number | null, currency?: string | null): string => {
    if (!price) return "—";
    const symbol = getCurrencySymbol(currency || "RUB");
    return `${price.toLocaleString("ru-RU")} ${symbol}`;
  };

  return (
    <div
      className={`flex flex-col overflow-x-auto min-w-0 price-table-horizontal-scroll pb-[30px] ${className}`}
    >
      {/* Обёртка для горизонтального скролла: заголовки и контент скроллятся вместе */}
      <div className="max-sm:min-w-[520px] sm:min-w-[400px]">
        {!hideHeader && (
          <div
            className={
              showAverageInCity
                ? "grid gap-x-4 mb-6 max-sm:px-[25px] sm:px-4 grid-cols-[1.8fr_1.1fr_1fr] sm:grid-cols-[2fr_0.72fr_0.38fr] md:grid-cols-[1fr_2fr_0.72fr_0.38fr]"
                : "grid gap-x-4 mb-6 max-sm:px-[25px] sm:px-4 grid-cols-[1.8fr_2.1fr] sm:grid-cols-[2fr_1.1fr] md:grid-cols-[1fr_2fr_1.1fr]"
            }
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
        )}

        {/* Категории и услуги */}
        <div className="flex flex-col gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              id={useCategoryAnchors ? (category.slug || category.id) : undefined}
              className="bg-unident-bgElements rounded-[16px] p-[25px] max-sm:min-w-[570px]"
            >
              {/* Mobile: категория на отдельной строке над услугами */}
              <Text
                variant="price-category-name"
                className="mb-3 text-unident-dark md:hidden"
              >
                {category.name}
              </Text>

              {/* Grid: mobile 3 колонки, desktop 4 колонки (или 2/3 при скрытой «Средняя в городе») */}
              <div
                className={
                  showAverageInCity
                    ? "grid max-sm:min-w-[520px] sm:min-w-[400px] gap-x-4 gap-y-[11px] grid-cols-[1.8fr_1.1fr_1fr] sm:grid-cols-[2fr_0.72fr_0.38fr] md:grid-cols-[1fr_2fr_0.72fr_0.38fr]"
                    : "grid max-sm:min-w-[520px] sm:min-w-[400px] gap-x-4 gap-y-[11px] grid-cols-[1.8fr_2.1fr] sm:grid-cols-[2fr_1.1fr] md:grid-cols-[1fr_2fr_1.1fr]"
                }
              >
                {/* Desktop: категория в первой колонке */}
                <div
                  className="hidden items-start md:flex"
                  style={{ gridRow: `span ${category.services.length}` }}
                >
                  <Text
                    variant="price-category-name"
                    className="text-unident-dark"
                  >
                    {category.name}
                  </Text>
                </div>

                {/* Услуги - каждая в своей строке */}
                {category.services.map((service) => {
                  // Берем первую цену (если есть несколько)
                  const price = service.prices[0];

                  // Не показываем услугу, если нет цены
                  if (!price) return null;

                  const cleanExcerpt = service.excerpt
                    ?.replace(/<[^>]*>/g, "")
                    .trim();

                  return (
                    <React.Fragment key={service.id}>
                      {/* Название услуги и excerpt - mobile: 14px */}
                      <div className="flex flex-col gap-[5px]">
                        {service.slug ? (
                          <Link
                            href={`/services/${service.slug}`}
                            className="text-unident-dark hover:text-unident-primary hover:underline transition-colors max-md:text-[14px]"
                          >
                            <Text
                              variant="price-service-name"
                              as="span"
                              className="text-inherit"
                            >
                              {service.title}
                            </Text>
                          </Link>
                        ) : (
                          <Text
                            variant="price-service-name"
                            className="text-unident-dark max-md:text-[14px]"
                          >
                            {service.title}
                          </Text>
                        )}
                        {cleanExcerpt && (
                          <Text
                            variant="price-service-excerpt"
                            className="text-unident-dark"
                          >
                            {cleanExcerpt}
                          </Text>
                        )}
                      </div>

                      {/* Наша цена - mobile: 14px */}
                      <Text
                        variant="price-our-price"
                        className={
                          showAverageInCity
                            ? "text-unident-dark text-right border-r border-dashed border-unident-borderGray pr-4 max-md:text-[14px] max-sm:whitespace-nowrap"
                            : "text-unident-dark text-right max-md:text-[14px] max-sm:whitespace-nowrap"
                        }
                      >
                        {formatPrice(price.regularPrice, price.currency)}
                      </Text>

                      {/* Средняя цена в городе - mobile: 14px */}
                      {showAverageInCity && (
                        <Text
                          variant="price-city-price"
                          className="text-unident-dark text-right max-md:text-[14px] max-sm:whitespace-nowrap"
                        >
                          {formatPrice(price.averagePriceCity, price.currency)}
                        </Text>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!hideAllPricesButton && (
        <Link href="/prices" className="mt-6 self-start">
          <Button unidentVariant="primary">Смотреть все цены</Button>
        </Link>
      )}
    </div>
  );
}
