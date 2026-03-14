/**
 * TypeScript types для меню WordPress
 * 
 * Соответствуют GraphQL schema WPGraphQL и ACF полям
 */

import type { ServiceCategory } from './services';

/**
 * ACF Image field type
 */
export interface ACFImage {
  node: {
    sourceUrl: string;
    altText?: string;
  };
}

/**
 * ACF поля для пункта меню
 */
export interface MenuItemSettings {
  /** Флаг мега-меню (для пункта "Услуги") */
  hasMegaMenu?: boolean | null;
  
  /** Категории услуг для мега-меню */
  megaMenuCategories?: {
    nodes: ServiceCategory[];
  } | null;
  
  /** Показывать промо в мега-меню */
  showPromo?: boolean | null;
}

/**
 * Пункт меню WordPress
 */
export interface MenuItem {
  /** GraphQL ID */
  id: string;
  
  /** Database ID */
  databaseId: number;
  
  /** Текст пункта меню */
  label: string;
  
  /** URL пункта меню */
  url: string;
  
  /** Path (относительный URL) */
  path?: string;

  /** Icon slug из ACF Select */
  icon?: string | null;

  /** Inline SVG markup для пользовательских иконок из Media Library */
  iconSvg?: string | null;
  
  /** Динамический счетчик для бейджа (автоматически из CPT или ACF fallback) */
  badgeCount?: number | null;
  
  /** Target (_blank, _self и т.д.) */
  target?: string | null;
  
  /** CSS классы */
  cssClasses?: string[] | null;
  
  /** Порядок сортировки */
  order?: number;
  
  /** ID родительского пункта */
  parentId?: number | null;
  
  /** ACF поля пункта меню */
  menuItemSettings?: MenuItemSettings | null;
  
  /** Категории для мега-меню (если указаны - только они отображаются, если нет - все) */
  megaMenuCategories?: {
    id: string;
    databaseId: number;
    name: string;
    slug: string;
  }[] | null;
  
  /** Дочерние пункты меню */
  childItems?: {
    nodes: MenuItem[];
  };
}

/**
 * Меню WordPress
 */
export interface Menu {
  /** GraphQL ID */
  id: string;
  
  /** Название меню */
  name: string;
  
  /** Slug меню */
  slug: string;
  
  /** Пункты меню */
  menuItems?: {
    nodes: MenuItem[];
  };
}

/**
 * Props для компонента навигационного меню
 */
export interface NavigationMenuProps {
  /** Меню для отображения */
  menu: Menu;
  
  /** CSS класс */
  className?: string;
  
  /** Флаг мобильного меню */
  isMobile?: boolean;
}

/**
 * Props для пункта меню
 */
export interface MenuItemComponentProps {
  /** Данные пункта меню */
  item: MenuItem;
  
  /** CSS класс */
  className?: string;
  
  /** Callback при клике */
  onClick?: () => void;
}
