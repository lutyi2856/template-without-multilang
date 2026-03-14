/**
 * TypeScript types для Promotion CPT
 *
 * Акции и специальные предложения клиники
 */

import type { Service } from './services';

/**
 * Минимальный объект цены из GraphQL relatedPrice (id, databaseId, regularPrice, promoPrice, currency).
 * Не требует title, slug, uri — они не запрашиваются в промо-фрагментах.
 */
export interface PromotionRelatedPrice {
  id?: string;
  databaseId?: number;
  regularPrice?: number | null;
  promoPrice?: number | null;
  currency?: string | null;
  period?: string | null;
  title?: string;
  slug?: string;
  uri?: string;
}

/**
 * Promotion - акция/промо-предложение
 */
export interface Promotion {
  /** GraphQL ID */
  id: string;
  
  /** Database ID */
  databaseId: number;
  
  /** Заголовок акции */
  title: string;
  
  /** Slug */
  slug: string;
  
  /** URI */
  uri?: string;
  
  /** Краткое описание */
  excerpt?: string | null;
  
  /** Полное содержимое */
  content?: string | null;
  
  /** Категории услуг (taxonomy service_categories) */
  serviceCategories?: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  } | null;

  /** Изображение акции */
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails?: {
        width: number;
        height: number;
      };
    };
  } | null;
  
  /** ACF relationship: связанные услуги (GraphQL connection format) */
  promotionRelationships?: {
    relatedServices?: {
      edges?: Array<{
        node: {
          id: string;
          title?: string;
          slug?: string;
          uri?: string;
          serviceRelationships?: {
            relatedPrices?: {
              edges?: Array<{
                node: {
                  priceFields?: {
                    promoPrice?: number | null;
                    regularPrice?: number | null;
                    currency?: string | null;
                    period?: string | null;
                  };
                };
              }>;
            };
          };
        };
      }>;
    };
  } | null;

  /** Связанная цена (1:1, bilateral) — минимальный набор из GraphQL */
  relatedPrice?: PromotionRelatedPrice | null;

  /** ACF promotionFields */
  promotionFields?: {
    actionIcon?: string | string[];
    actionType?: string | string[];
    endDate?: string;
    discountLabelText?: string | null;
    showDiscountPercent?: boolean | null;
    futures?: Array<{ text: string }>;
  } | null;

  /** Inline SVG иконки действия (manual GraphQL registration) */
  actionIconSvg?: string | null;

  /** Связанные услуги с категориями и ценами (flat format) */
  relatedServices?: Array<{
    id: string;
    title: string;
    slug: string;
    serviceCategories?: {
      nodes: Array<{
        id: string;
        name: string;
        slug: string;
      }>;
    };
    relatedPrices?: Array<{
      id: string;
      databaseId: number;
      promoPrice?: number | null;
      regularPrice?: number | null;
      currency?: string | null;
    }>;
  }> | null;
}

/**
 * Promotion Fields Fragment
 * 
 * Базовые поля для GraphQL запросов
 */
export const PROMOTION_FIELDS_FRAGMENT = `
  id
  databaseId
  title
  slug
  uri
  excerpt
  content
  featuredImage {
    node {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
  }
`;
