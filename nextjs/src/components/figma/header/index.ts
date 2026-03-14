/**
 * Header Components - экспорт всех компонентов header
 */

/**
 * Header Components - универсальные компоненты header
 * 
 * Main components:
 * - HeaderV2: Основной header с WordPress интеграцией
 * - TopBar: Верхняя панель (accessibility, карта сайта, промо, соц.сети)
 * - MainHeader: Логотип, рейтинг, инфо блоки, CTA
 * - Navigation: Меню + поиск
 */

// Main Header Component
export { HeaderV2 } from './header-v2';

// TopBar & MainHeader
export { TopBar } from './top-bar';
export { MainHeader } from './main-header';
export { Navigation } from './navigation';

// Reusable Components
export { InfoBlock } from './info-block';
export { Logo } from './logo';
export { Rating } from './rating';
export { SearchBar } from './search-bar';
export { SearchBarWithSuggestions } from './search-bar-with-suggestions';
export { SocialLinks } from './social-links';
export { NavItem } from './nav-item';
export { NavDropdown } from './nav-dropdown';
export { MobileMenu } from './mobile-menu';

// Legacy/Fallback
export { Header } from './header';
export { HeaderClientWrapper } from './header-client-wrapper';
export { PromoBlock } from './promo-block';
export { ServiceCategoryList } from './service-category-list';
export { ServiceList } from './service-list';

// Types
export type * from './types';
