import type { Promotion } from "@/types/promotion";

/**
 * Получить цену акции: приоритет у прямой связи Promotion → Price,
 * fallback на цепочку Promotion → Service → Price.
 *
 * Поддерживает разные форматы данных (relatedServices, promotionRelationships).
 */
export function getPromotionPrice(promotion: Promotion): {
  regularPrice?: number | null;
  promoPrice?: number | null;
  currency?: string | null;
  period?: string | null;
} | null {
  const fromPrice = (p: {
    regularPrice?: number | null;
    promoPrice?: number | null;
    currency?: string | null;
    period?: string | null;
    priceFields?: {
      regularPrice?: number | null;
      promoPrice?: number | null;
      currency?: string | null;
      period?: string | null;
    };
  }) => ({
    regularPrice: p.regularPrice ?? p.priceFields?.regularPrice,
    promoPrice: p.promoPrice ?? p.priceFields?.promoPrice,
    currency: p.currency ?? p.priceFields?.currency,
    period: p.period ?? p.priceFields?.period,
  });

  const direct = promotion.relatedPrice;
  if (direct && (direct.regularPrice != null || direct.promoPrice != null)) {
    const r = fromPrice(direct);
    if (r.regularPrice != null || r.promoPrice != null) return r;
  }

  const chain = promotion.relatedServices?.[0]?.relatedPrices?.[0];
  if (chain) {
    const r = fromPrice(chain);
    if (r.regularPrice != null || r.promoPrice != null) return r;
  }

  const headerNode =
    promotion.promotionRelationships?.relatedServices?.edges?.[0]?.node?.serviceRelationships
      ?.relatedPrices?.edges?.[0]?.node;
  if (headerNode?.priceFields) {
    return headerNode.priceFields;
  }

  return null;
}
