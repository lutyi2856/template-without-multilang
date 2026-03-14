/**
 * TypeScript типы и интерфейсы для Header компонентов
 * 
 * @module HeaderTypes
 */

// ============================================================================
// Базовые типы
// ============================================================================

/**
 * Язык интерфейса
 */
export interface Language {
  code: string;
  label: string;
  flag?: string;
}

/**
 * Социальная сеть
 */
export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  iconSvg?: string | null;
  ariaLabel?: string;
  color?: string;
  bgColor?: string;
}

/**
 * Рабочее время
 */
export interface WorkingHours {
  weekdays: string;
  weekend: string;
  timezone?: string;
}

/**
 * Клиника/филиал
 */
export interface Clinic {
  id: string;
  name: string;
  address: string;
  metro?: string;
  metroLine?: string;
  phone?: string;
}

/**
 * Рейтинг
 */
export interface Rating {
  value: number;
  maxValue: number;
  source: string;
  reviewCount?: number;
  icon?: string;
}

/**
 * Информационный блок (клиники, телефон, часы работы)
 */
export interface InfoBlock {
  icon: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Элемент навигации
 */
export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  iconSvg?: string | null;
  badge?: string;
  badgeVariant?: 'count' | 'new';
  discount?: string;
  children?: NavItem[];
  hasMegaMenu?: boolean;
  megaMenuCategories?: {
    id: string;
    databaseId: number;
    name: string;
    slug: string;
  }[];
}

/**
 * Контактная информация
 */
export interface ContactInfo {
  phone: string;
  email?: string;
  workingHours: WorkingHours;
}

// ============================================================================
// Props интерфейсы для компонентов
// ============================================================================

/**
 * Props для главного компонента Header
 */
export interface HeaderProps {
  className?: string;
  // TopBar
  socialLinks?: SocialLink[];
  promoText?: string;
  showAccessibilityLink?: boolean;
  showSiteMap?: boolean;
  // MainHeader
  logo?: { url: string; alt?: string | null; width?: number | null; height?: number | null } | null;
  logoIcon?: string | null;
  logoIconSvg?: string | null;
  logoUrl?: string; // Deprecated: use logo
  logoText?: string; // Deprecated: removed, no text in logo
  rating?: Rating;
  infoBlocks?: InfoBlock[]; // Клиники, телефон, часы работы
  ctaText?: string;
  ctaHref?: string;
  // Navigation
  navigation?: NavItem[];
  searchPlaceholder?: string;
  // Deprecated (for compatibility)
  languages?: Language[];
  currentLanguage?: string;
  contactInfo?: ContactInfo;
  clinics?: Clinic[];
}

/**
 * Props для TopBar компонента
 */
export interface TopBarProps {
  className?: string;
  languages?: Language[];
  currentLanguage?: string;
  socialLinks?: SocialLink[];
  contactInfo?: ContactInfo;
  promoText?: string;
  ctaText?: string;
  ctaHref?: string;
  showAccessibilityLink?: boolean;
  showSiteMap?: boolean;
}

/**
 * Props для MainHeader компонента
 */
export interface MainHeaderProps {
  className?: string;
  logoMode?: 'image' | 'icon';
  logo?: { url: string; alt?: string | null; width?: number | null; height?: number | null } | null;
  logoIcon?: string | null;
  logoIconSvg?: string | null;
  rating?: Rating;
  infoBlocks?: InfoBlock[];
  ctaText?: string;
  ctaHref?: string;
  navigation?: NavItem[];
  searchPlaceholder?: string;
  socialLinks?: SocialLink[];
  showAccessibilityLink?: boolean;
  // Deprecated (для совместимости)
  clinics?: Clinic[];
  contactInfo?: ContactInfo;
}

/**
 * Props для Navigation компонента
 */
export interface NavigationProps {
  className?: string;
  items?: NavItem[];
  showSearch?: boolean;
  searchPlaceholder?: string;
}

/**
 * Props для Logo компонента
 */
export interface LogoProps {
  className?: string;
  href?: string;
  /** Display mode: image or icon only */
  logoMode?: 'image' | 'icon';
  /** Image from WordPress (logo field) */
  logo?: { url: string; alt?: string | null; width?: number | null; height?: number | null } | null;
  /** Icon slug (e.g. 'tooth', 'media-42') */
  logoIcon?: string | null;
  /** Inline SVG for media-* icons */
  logoIconSvg?: string | null;
  /** Optional className for icon (e.g. text-white for footer on dark background) */
  iconClassName?: string;
}

/**
 * Props для LanguageSelect компонента
 */
export interface LanguageSelectProps {
  className?: string;
  languages?: Language[];
  currentLanguage?: string;
  onChange?: (language: string) => void;
}

/**
 * Props для SocialLinks компонента
 */
export interface SocialLinksProps {
  className?: string;
  links?: SocialLink[];
}

/**
 * Props для ContactInfo компонента
 */
export interface ContactInfoProps {
  className?: string;
  phone: string;
  workingHours: WorkingHours;
}

/**
 * Props для Rating компонента
 */
export interface RatingProps {
  className?: string;
  value: number;
  maxValue?: number;
  source: string;
  reviewCount?: number;
  icon?: string;
}

/**
 * Props для ClinicInfo компонента
 */
export interface ClinicInfoProps {
  className?: string;
  clinics?: Clinic[];
}

/**
 * Props для SearchBar компонента
 */
export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  fullWidth?: boolean;
}

/**
 * Props для NavItem компонента
 */
export interface NavItemProps {
  className?: string;
  item: NavItem;
}

/**
 * Props для NavDropdown компонента
 */
export interface NavDropdownProps {
  className?: string;
  item: NavItem;
}

