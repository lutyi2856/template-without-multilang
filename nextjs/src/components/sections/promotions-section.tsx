/**
 * PromotionsSection - секция с акциями
 *
 * Компонент отображает карточки акций на главной странице.
 * Данные загружаются динамически из WordPress через GraphQL.
 *
 * Дизайн из Figma: promotion-card 1703:145
 * - Заголовок H2: customizable через ACF
 * - EMBLA CAROUSEL слайдер карточек (3 cards per slide, Level 1)
 * - Кнопка: "Все акции" → /promotions
 *
 * PERFORMANCE:
 * - Server Component для data fetching
 * - Client Component обертка для слайдера
 * - ISR: revalidate каждый час (акции меняются редко)
 *
 * @example
 * <PromotionsSection />
 */

import { getPromotionsForHomepage, getMainPageSettings } from "@/lib/wordpress";
import { Section, Heading, Container } from "@/components/design-system";
import { PromotionsSectionClient } from "./promotions-section-client";

interface PromotionsSectionProps {
  className?: string;
}

export async function PromotionsSection({
  className = "",
}: PromotionsSectionProps) {
  // Fetch данных из WordPress
  let promotions: any[] = [];
  let settings: any = null;

  try {
    // Параллельные запросы
    [promotions, settings] = await Promise.all([
      getPromotionsForHomepage(8), // 8 акций для слайдера (3 per slide = ~3 слайда)
      getMainPageSettings(),
    ]);
  } catch (error: any) {
    console.error("[PromotionsSection] Error fetching data:", error);
  }

  // Если нет акций - не показываем секцию
  if (!promotions || promotions.length === 0) {
    return null;
  }

  // Заголовок и описание из ACF Option Page
  const title =
    settings?.promotionsSectionTitle || "Акции и специальные предложения";
  const description =
    settings?.promotionsSectionDescription ||
    "Не упустите выгодные предложения на стоматологические услуги";

  return (
    <Section
      variant="default"
      spacing="none"
      className={`pt-16 pb-16 ${className}`}
    >
      {/* Client Component с слайдером и хедером */}
      <PromotionsSectionClient 
        promotions={promotions}
        title={title}
        description={description}
        fallbackImage={settings?.promotionsFallbackImage}
      />
    </Section>
  );
}

// ISR: Revalidate каждый час
export const revalidate = 3600;
