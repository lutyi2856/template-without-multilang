/**
 * TypeScript types для настроек шапки сайта
 * 
 * Соответствуют ACF Option Page "Header Settings"
 */

import type { Promotion } from './promotion';
import type { SocialLink } from '@/components/figma/header/types';

/**
 * Working Hours (ACF Group Field)
 */
export interface WorkingHours {
  /** Будние дни */
  weekdays?: string | null;
  
  /** Выходные */
  weekend?: string | null;
}

/**
 * Header Settings (ACF Option Page)
 * Uses nested structure (WPGraphQL ACF automatic registration)
 */
/** Logo image from Header Settings */
export interface HeaderSettingsLogo {
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface HeaderSettings {
  /** Logo display mode: image or icon */
  logoMode?: 'image' | 'icon' | null;
  /** Logo image */
  logo?: HeaderSettingsLogo | null;
  /** Logo icon slug (e.g. tooth, media-42) */
  logoIcon?: string | null;
  /** Inline SVG for logo icon (media-* from Media Library) */
  logoIconSvg?: string | null;
  /** Featured promotion для header promo block */
  featuredPromotion?: Promotion | null;
  
  /** Телефон */
  phone?: string | null;
  
  /** Расписание работы телефона */
  phoneSchedule?: string | null;
  
  /** Email */
  email?: string | null;
  
  /** Часы работы */
  workingHours?: WorkingHours | null;
  
  /** Количество локаций */
  locationsCount?: number | null;
  
  /** Социальные сети (Repeater Field) */
  socialLinks?: SocialLink[] | null;
}

/**
 * Props для PromoBlock компонента
 */
export interface PromoBlockProps {
  /** Promotion с данными о service и price */
  promotion: Promotion;
  
  /** CSS класс */
  className?: string;
  
  /** Callback при клике на крестик */
  onClose?: () => void;
}

/**
 * Props для ContactInfo компонента
 */
export interface ContactInfoProps {
  /** Телефон */
  phone?: string | null;
  
  /** Email */
  email?: string | null;
  
  /** Часы работы */
  workingHours?: WorkingHours | null;
  
  /** CSS класс */
  className?: string;
}

/**
 * Props для MenuBadge компонента
 */
export interface MenuBadgeProps {
  /** Количество элементов */
  count: number;
  
  /** Вариант стиля */
  variant?: 'primary' | 'secondary';
  
  /** CSS класс */
  className?: string;
}
