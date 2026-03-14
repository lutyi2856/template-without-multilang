/**
 * PromotionCard - карточка акции для блока цен
 *
 * Отображает выбранную акцию с данными:
 * - Бейдж "Горячее предложение" (статичный)
 * - Заголовок акции
 * - Описание акции
 * - Цена из связи: Promotion → Service → Price
 *
 * Дизайн из Figma: node 93:302 (promotion card)
 */

import { Text, Heading, Badge } from "@/components/design-system";
import { getCurrencySymbol } from "@/lib/currency";
import { getPromotionPrice } from "@/lib/utils/promotion-price";
import type { Promotion } from "@/types/promotion";

interface PromotionCardProps {
  promotion: Promotion | null;
  className?: string;
}

export function PromotionCard({
  promotion,
  className = "",
}: PromotionCardProps) {
  if (!promotion) {
    return null;
  }

  const priceFields = getPromotionPrice(promotion as Parameters<typeof getPromotionPrice>[0]);
  const displayPrice = priceFields?.promoPrice ?? priceFields?.regularPrice;
  const symbol = getCurrencySymbol(priceFields?.currency || "RUB");
  const formattedPrice = displayPrice != null
    ? `${displayPrice.toLocaleString("ru-RU")} ${symbol}`
    : null;

  // Описание: используем excerpt или первые 200 символов content
  // Убираем HTML теги из WordPress для чистого текста
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const rawDescription =
    promotion.excerpt || promotion.content?.substring(0, 200) || "";
  const description = stripHtml(rawDescription);

  return (
    <div
      className={`bg-unident-bgTopbar rounded-[25px] p-6 flex flex-col gap-4 ${className}`}
    >
      {/* Бейдж "Горячее предложение" */}
      <Badge variant="promotion" className="self-start">
        Горячее предложение
      </Badge>

      {/* Заголовок акции */}
      <Heading
        level={3}
        className="text-unident-dark text-[28px] font-semibold leading-[1.19]"
      >
        {promotion.title}
      </Heading>

      {/* Описание акции */}
      {description && (
        <Text variant="default" className="text-unident-dark">
          {description}
        </Text>
      )}

      {/* Цена */}
      {formattedPrice && (
        <Text className="text-unident-dark text-[24px] font-bold">
          {formattedPrice}
        </Text>
      )}
    </div>
  );
}
