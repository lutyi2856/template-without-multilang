/**
 * TypeScript types для услуг и категорий
 *
 * Соответствуют GraphQL schema WPGraphQL
 */

import type { Price } from "./price";
import type { Promotion } from "./promotion";
import type { Doctor } from "@/lib/wordpress/api";

/**
 * Категория услуг (Taxonomy: service_categories)
 */
export interface ServiceCategory {
  /** GraphQL ID */
  id: string;
  
  /** Database ID */
  databaseId: number;
  
  /** Название категории */
  name: string;
  
  /** Slug категории */
  slug: string;
  
  /** Описание */
  description?: string | null;
  
  /** Количество услуг в категории */
  count?: number | null;
  
  /** URI категории */
  uri?: string;
  
  /** Slug иконки из ACF (category_icon) */
  icon?: string | null;
  
  /** Услуги в категории */
  services?: {
    nodes: ServicePost[];
    pageInfo?: {
      total?: number;
    };
  };
}

/**
 * Пост услуги (CPT: services)
 * @alias Service - для обратной совместимости
 */
export interface ServicePost {
  /** GraphQL ID */
  id: string;
  
  /** Database ID */
  databaseId: number;
  
  /** Заголовок услуги */
  title: string;
  
  /** Slug */
  slug: string;
  
  /** URI */
  uri: string;
  
  /** Дата публикации */
  date?: string;
  
  /** Дата изменения */
  modified?: string;
  
  /** Краткое описание */
  excerpt?: string | null;
  
  /** Полное содержимое */
  content?: string | null;
  
  /** Изображение */
  featuredImage?: {
    node: {
      id: string;
      sourceUrl: string;
      altText: string;
      mediaDetails?: {
        width: number;
        height: number;
      };
    };
  } | null;
  
  /** Категории услуги */
  serviceCategories?: {
    nodes: ServiceCategory[];
  };
  
  /** ACF поля услуги */
  serviceFields?: {
    price?: string | null;
    priceFrom?: string | null;
    priceTo?: string | null;
    duration?: string | null;
    description?: string | null;
    isPopular?: boolean | null;
    discount?: string | null;
  } | null;
  
  /** Особенности услуги (repeater) */
  serviceFeatures?: Array<{ text: string }> | null;
  
  /** Field group с relationships */
  serviceRelationships?: {
    relatedPrices?: {
      edges: Array<{
        node: Price;
      }>;
    } | null;
    relatedPromotions?: {
      edges: Array<{
        node: Promotion;
      }>;
    } | null;
  } | null;

  /** Related prices (list format, manual GraphQL registration) */
  relatedPrices?: Price[] | null;

  /** Focus prices (list format, manual GraphQL registration) */
  focusPrices?: Price[] | null;

  /** Related promotions (list format, for service page promo banner) */
  relatedPromotions?: Promotion[] | null;

  /** Slug иконки из ACF (service_icon) */
  icon?: string | null;

  /** Inline SVG markup для иконок из Media Library */
  iconSvg?: string | null;

  /** Блоки страницы услуги (ACF, manual GraphQL registration) */
  servicePageBlocks?: {
    doctorsSectionShow?: boolean | null;
    doctorsSectionTitle?: string | null;
    doctorsSectionDescription?: string | null;
    relatedDoctors?: Doctor[] | null;
    showPriceBlock?: boolean | null;
    exactPriceBlockIcon?: string | null;
    exactPriceBlockText?: string | null;
    exactPriceBlockLink?: string | null;
    staTitle?: string | null;
    staDescription?: string | null;
    staPhone?: string | null;
    staPrivacyText?: string | null;
    staPrivacyLink?: string | null;
  staDoctorImage?: { url?: string; width?: number; height?: number; alt?: string } | null;
  staBackgroundImage?: { url?: string; width?: number; height?: number; alt?: string } | null;
  servicesBlockShow?: boolean | null;
  servicesBlockTitle?: string | null;
  blockServices?: ServiceSliderItem[] | null;
  } | null;
}

/**
 * Минимальные поля для слайдера услуг (карточка в блоке «Другие услуги»)
 */
export interface ServiceSliderItem {
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  iconSvg?: string | null;
}

/**
 * Настройки страниц услуг (Option Page)
 */
export interface ServicePagesSettings {
  showPriceBlock?: boolean | null;
  exactPriceBlockIcon?: string | null;
  exactPriceBlockText?: string | null;
  exactPriceBlockLink?: string | null;
  doctorsSectionTitle?: string | null;
  doctorsSectionDescription?: string | null;
  selectedDoctors?: Doctor[] | null;
  staTitle?: string | null;
  staDescription?: string | null;
  staPhone?: string | null;
  staPrivacyText?: string | null;
  staPrivacyLink?: string | null;
  staDoctorImage?: { url?: string; width?: number; height?: number; alt?: string } | null;
  staBackgroundImage?: { url?: string; width?: number; height?: number; alt?: string } | null;
  servicesBlockShow?: boolean | null;
  servicesBlockTitle?: string | null;
  selectedServices?: ServiceSliderItem[] | null;
}

/** @deprecated Use ServicePost. Alias для обратной совместимости */
export type Service = ServicePost;

/**
 * Props для MegaMenu компонента
 */
export interface MegaMenuProps {
  /** Категории услуг */
  categories: ServiceCategory[];
  
  /** Выбранная категория */
  selectedCategory?: ServiceCategory | null;
  
  /** Callback при выборе категории */
  onSelectCategory: (category: ServiceCategory) => void;
  
  /** Callback при закрытии */
  onClose?: () => void;
  
  /** CSS класс */
  className?: string;
}

/**
 * Props для ServiceCategoryList компонента
 */
export interface ServiceCategoryListProps {
  /** Категории услуг */
  categories: ServiceCategory[];
  
  /** Выбранная категория */
  selectedCategory?: ServiceCategory | null;
  
  /** Callback при выборе категории */
  onSelectCategory: (category: ServiceCategory) => void;
  
  /** CSS класс */
  className?: string;
}

/**
 * Props для ServiceList компонента
 */
export interface ServiceListProps {
  /** Услуги */
  services: ServicePost[];
  
  /** CSS класс */
  className?: string;
  
  /** Максимальное количество услуг */
  maxItems?: number;
}

/**
 * Props для ServiceCard компонента
 */
export interface ServiceCardProps {
  /** Данные услуги */
  service: ServicePost;
  
  /** CSS класс */
  className?: string;
  
  /** Вариант отображения */
  variant?: 'default' | 'compact';
}
