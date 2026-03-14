/**
 * TypeScript types для Price CPT
 * 
 * Цены на услуги клиники с поддержкой акционных цен
 */

import type { Service } from './services';
import type { Promotion } from './promotion';

/**
 * Price - цена на услугу
 */
export interface Price {
  /** GraphQL ID */
  id: string;
  
  /** Database ID */
  databaseId: number;
  
  /** Название цены */
  title: string;
  
  /** Slug */
  slug: string;
  
  /** URI */
  uri: string;
  
  /** Focus services (list format, manual GraphQL registration) */
  focusServices?: Service[] | null;

  /** Связанная акция (1:1, bilateral) */
  relatedPromotion?: Promotion | null;

  /** Field group с полями цены */
  priceFields?: {
    /** Обычная цена (без скидки) */
    regularPrice?: number | null;
    
    /** Цена по акции (со скидкой) */
    promoPrice?: number | null;
    
    /** Валюта (₽, $, €) */
    currency?: string | null;
    
    /** Период оплаты (мес, год, процедура) */
    period?: string | null;
    
    /** Условия рассрочки */
    installmentTerms?: string | null;
    
    /** Средняя цена в городе (для сравнения) */
    averagePriceCity?: number | null;
  } | null;
}

/**
 * Price Fields Fragment
 * 
 * Базовые поля для GraphQL запросов
 */
export const PRICE_FIELDS_FRAGMENT = `
  id
  databaseId
  title
  slug
  uri
  regularPrice
  promoPrice
  currency
  period
  installmentTerms
  averagePriceCity
`;
