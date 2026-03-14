/**
 * PriceSection - секция с ценами на услуги
 *
 * Компонент отображает секцию цен с двумя колонками:
 * - Левая: таблица цен по категориям
 * - Правая: карточка акции + форма записи
 *
 * Дизайн из Figma: node 93:302
 *
 * PERFORMANCE:
 * - Server Component (без 'use client')
 * - ISR: revalidate каждый час
 * - Fetch данных на сервере с кэшированием
 *
 * @example
 * <PriceSection />
 */

import { Heading, Container } from "@/components/design-system";
import { PriceTable } from "@/components/figma/price/price-table";
import { PromotionCard } from "@/components/figma/price/promotion-card";
import { AppointmentForm } from "@/components/figma/price/appointment-form";
import {
  getPricesByCategories,
  getMainPageSettings,
  getContactsSettings,
  getPriceArchiveSettings,
} from "@/lib/wordpress/api";

interface PriceSectionProps {
  /** CSS класс для кастомизации */
  className?: string;
}

/**
 * Секция с ценами
 *
 * Расположение: может быть на главной странице или на странице /prices
 */
export async function PriceSection({ className = "" }: PriceSectionProps) {
  // Сначала получаем mainPageSettings для фильтра выбранных услуг
  const [mainPageSettings, contactsSettings, priceArchiveSettings] =
    await Promise.all([
      getMainPageSettings(),
      getContactsSettings(),
      getPriceArchiveSettings(),
    ]);

  const selectedIds = mainPageSettings?.selectedServicesBlockPrice?.map(
    (s) => s.databaseId
  );
  const categoriesWithPrices = await getPricesByCategories(
    selectedIds?.length ? selectedIds : undefined
  );

  // Если цен нет, не рендерим секцию
  if (!categoriesWithPrices || categoriesWithPrices.length === 0) {
    console.warn(
      "[PriceSection] No categories with prices. Count:",
      categoriesWithPrices?.length || 0
    );
    return null;
  }

  console.log(
    "[PriceSection] Rendering with",
    categoriesWithPrices.length,
    "categories"
  );

  // Выбранная акция из Main Page Settings (таб "Block 10 | Блок цен")
  const selectedPromotion = mainPageSettings?.selectedPromotion || null;

  return (
    <section className={`py-16 ${className}`}>
      {/* Контейнер с максимальной шириной */}
      <Container size="xl">
        {/* Заголовок */}
        <Heading
          level={2}
          variant="doctors-heading"
          className="mb-[clamp(1.875rem,1.48rem+1.69vw,3rem)] text-unident-dark"
        >
          {(mainPageSettings?.blockPriceTitle?.trim() ||
            "Сколько стоит забота о себе")}{" "}
          🩺
        </Heading>

        {/* Две колонки: таблица цен + акция/форма */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Левая колонка - Таблица цен (min-w-0 для overflow-x на mobile) */}
          <div className="min-w-0">
            <PriceTable
              categories={categoriesWithPrices}
              showAverageInCity={priceArchiveSettings?.showAverageInCity ?? true}
            />
          </div>

          {/* Правая колонка - Карточка акции + Форма записи */}
          <div className="flex flex-col lg:flex-row xl:flex-col gap-6 lg:gap-8 xl:gap-6 lg:sticky lg:top-[200px] lg:self-start">
            {/* Карточка акции */}
            <div className="lg:flex-1 lg:min-w-0">
              <PromotionCard promotion={selectedPromotion} />
            </div>

            {/* Форма записи */}
            <div className="lg:flex-1 lg:min-w-0">
              <AppointmentForm contacts={contactsSettings} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ISR: Revalidate каждый час
export const revalidate = 3600;
