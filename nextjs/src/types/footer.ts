/**
 * TypeScript types для настроек футера (ACF Option Page Footer)
 */

/**
 * Часы работы в футере (переопределение или из Header)
 */
export interface FooterWorkingHours {
  weekdays?: string | null;
  weekend?: string | null;
}

/**
 * Ссылка на соцсеть в футере (repeater: name, icon, url)
 */
export interface FooterSettingsSocialLink {
  name?: string | null;
  icon?: string | null;
  iconSvg?: string | null;
  url?: string | null;
}

/**
 * Footer Settings из ACF Option Page
 */
export interface FooterSettings {
  logoMode?: 'image' | 'icon' | null;
  logo?: { url: string; alt?: string | null; width?: number | null; height?: number | null } | null;
  logoIcon?: string | null;
  logoIconSvg?: string | null;
  phoneCaption?: string | null;
  addressSchemeUrl?: string | null;
  workingHours?: FooterWorkingHours | null;
  copyrightLeft?: string | null;
  disclaimerCenter?: string | null;
  socialLinks?: FooterSettingsSocialLink[] | null;
}
