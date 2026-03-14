/**
 * TypeScript types для Main Page Settings Option Page
 * 
 * Настройки главной страницы (Hero блок, Акция, CTA)
 */

import type { Promotion } from './promotion';

/**
 * Hero Image - изображение для hero блока
 */
export interface HeroImage {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

/**
 * CTA Image - изображение для блока CTA
 */
export interface CtaImage {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
}

/**
 * Promotion для MainPageSettings (упрощенная структура из GraphQL)
 */
export interface MainPagePromotion {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  excerpt?: string | null;
  content?: string | null;
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
    actionType?: string | null;
    endDate?: string | null;
  } | null;
  actionIconSvg?: string | null;
  promotionFutures?: Array<{ text: string }> | null;
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

/**
 * Элемент repeater секции отзовиков (источник отзывов)
 */
export interface MainPageReviewsSectionItem {
  rating?: number | null;
  image?: CtaImage | null;
  text?: string | null;
  reviewsCount?: number | null;
  link?: string | null;
}

/**
 * Элемент repeater блока Преимущества (StatsBlock)
 */
export interface MainPagePreferenceItem {
  icon?: string | null;
  iconSvg?: string | null;
  title?: string | null;
  description?: string | null;
  href?: string | null;
}

/**
 * Элемент repeater секции «Нам доверили»
 */
export interface MainPageTrustedItem {
  number?: string | null;
  title?: string | null;
  description?: string | null;
}

/**
 * Элемент repeater секции лицензий
 */
export interface MainPageLicenseItem {
  image?: CtaImage | null;
  licenseTitle?: string | null;
  textLicenzia?: string | null;
}

/**
 * Main Page Settings - настройки главной страницы
 */
export interface MainPageSettings {
  /** Изображение для hero-блока */
  heroImage?: HeroImage | null;

  /** Декоративный вектор на фоне hero-блока */
  heroVectorImage?: HeroImage | null;
  
  /** Заголовок hero-блока */
  heroTitle?: string | null;
  
  /** Подзаголовок hero-блока */
  heroSubtitle?: string | null;

  /** Бейджи Hero-блока (динамический repeater) */
  heroBadges?: { text: string }[] | null;
  
  /** Акция для главной страницы */
  featuredAction?: MainPagePromotion | null;
  
  /** Заголовок блока CTA */
  ctaTitle?: string | null;
  
  /** Описание блока CTA */
  ctaDescription?: string | null;
  
  /** Номер телефона для блока CTA */
  ctaPhone?: string | null;
  
  /** Текст политики конфиденциальности для блока CTA */
  ctaPrivacyText?: string | null;
  
  /** Ссылка на страницу политики конфиденциальности */
  ctaPrivacyLink?: string | null;
  
  /** Фото врача для блока CTA */
  ctaDoctorImage?: CtaImage | null;
  
  /** Фоновое изображение для блока CTA */
  ctaBackgroundImage?: CtaImage | null;
  
  /** The doctor's image for the second STA */
  ctaDoctorImage2?: CtaImage | null;

  /** Фото врача для первого CTA (мобайл/планшет) */
  ctaDoctorImageMobile?: CtaImage | null;

  /** Фото врача для второго CTA (мобайл/планшет) */
  ctaDoctorImage2Mobile?: CtaImage | null;
  
  /** Изображение для блока руководства (декоративное) */
  guidanceImage?: HeroImage | null;
  
  /** Контент цитаты (HTML из WYSIWYG) */
  guidanceContent?: string | null;
  
  /** Изображение руководителя (аватар) */
  guidanceManagerImage?: HeroImage | null;
  
  /** Фамилия и имя руководителя (HTML из WYSIWYG) */
  guidanceSubscribe?: string | null;
  
  /** Должности руководителя */
  guidancePositions?: string | null;
  
  /** Медиа изображение (фото врача) */
  guidanceMediaImage?: HeroImage | null;
  
  /** Заголовок секции "Акции" */
  promotionsSectionTitle?: string | null;
  
  /** Описание секции "Акции" */
  promotionsSectionDescription?: string | null;
  
  /** Фолбэк изображение для карточек акций без featured image */
  promotionsFallbackImage?: CtaImage | null;

  /** Заголовок секции отзовиков */
  reviewsSectionTitle?: string | null;

  /** Контент секции отзовиков */
  reviewsSectionContent?: string | null;

  /** Изображение секции отзовиков (медаль и т.п.) */
  reviewsSectionImage?: CtaImage | null;

  /** Суффикс шкалы рейтинга (например "/5.0") */
  reviewsSectionMediumRating?: string | null;

  /** Основание для рейтинга (например "на основе") */
  reviewsSectionBasis?: string | null;

  /** Элементы repeater: источники отзывов */
  reviewsSectionItems?: MainPageReviewsSectionItem[] | null;

  /** Заголовок секции лицензий */
  licensesSectionTitle?: string | null;

  /** Лицензии (repeater) */
  licensee?: MainPageLicenseItem[] | null;

  /** Карточки блока Преимущества (StatsBlock) */
  preferencesItems?: MainPagePreferenceItem[] | null;

  /** Заголовок секции «Нам доверили» */
  trustedTitle?: string | null;

  /** Описание секции «Нам доверили» (HTML из WYSIWYG) */
  trustedDescription?: string | null;

  /** Карточки секции «Нам доверили» */
  trustedItems?: MainPageTrustedItem[] | null;

  /** Колонок на десктопе (1–4) */
  trustedColumns?: number | null;

  /** Заголовок секции «Клиники на карте» */
  clinicsMapTitle?: string | null;

  /** Выбранная акция для блока цен (Block 10) */
  selectedPromotion?: Promotion | null;

  /** Заголовок блока цен */
  blockPriceTitle?: string | null;

  /** Выбранные услуги для блока цен (фильтр таблицы) */
  selectedServicesBlockPrice?: {
    id: string;
    databaseId: number;
    title: string;
    slug: string;
  }[] | null;
}
