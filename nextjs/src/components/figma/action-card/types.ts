/**
 * TypeScript интерфейсы для Action Card компонентов
 */

export interface ActionCardData {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  excerpt?: string | null;
  /** Featured Image из WordPress поста (не ACF поле) */
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
      mediaDetails?: {
        width?: number;
        height?: number;
      };
    };
  } | null;
  promotionFields?: {
    actionIcon?: string | null;
    actionType?: "promo" | "special" | "limited" | "sale" | null;
    endDate?: string | null;
    price?: string | null;
  } | null;
  actionIconSvg?: string | null;
  /** Futures repeater field - список преимуществ акции */
  promotionFutures?: Array<{ text: string }> | null;
  /** Связанные услуги: Promotion → Service → Price */
  relatedServices?: Array<{
    id?: string;
    databaseId?: number;
    title?: string;
    relatedPrices?: Array<{
      id?: string;
      databaseId?: number;
      promoPrice?: number | null;
      regularPrice?: number | null;
      currency?: string | null;
    }> | null;
  }> | null;
}

export interface ActionCardProps {
  data: ActionCardData;
  className?: string;
}
