/**
 * PromotionsSectionForPrices - блок акций для страницы /prices
 *
 * Аналогично PromotionsSection на главной (слайдер Embla, 3 карточки на слайд).
 * Данные: getPromotionsForPriceArchive(selectedPromotions) — выбранные первыми, затем остальные.
 *
 * Заголовок/описание — из Main Page settings.
 */

import { Section } from "@/components/design-system";
import { PromotionsSectionClient } from "./promotions-section-client";
import type { CtaImage } from "@/types/main-page";
import type { Promotion } from "@/types/promotion";

interface PromotionsSectionForPricesProps {
  promotions: Promotion[];
  title?: string | null;
  description?: string | null;
  fallbackImage?: CtaImage | null;
}

export function PromotionsSectionForPrices({
  promotions,
  title,
  description,
  fallbackImage,
}: PromotionsSectionForPricesProps) {
  if (!promotions || promotions.length === 0) {
    return null;
  }

  const sectionTitle =
    title || "Акции и специальные предложения";
  const sectionDescription =
    description ||
    "Не упустите выгодные предложения на стоматологические услуги";

  return (
    <Section
      variant="default"
      spacing="none"
      className="pt-16 pb-16"
    >
      <PromotionsSectionClient
        promotions={promotions}
        title={sectionTitle}
        description={sectionDescription}
        fallbackImage={fallbackImage}
      />
    </Section>
  );
}
