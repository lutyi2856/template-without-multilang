/**
 * TypeScript types для CTA Settings
 * 
 * Настройки блока CTA (Call To Action) - часть MainPageSettings Option Page
 */

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
 * CTA Settings - настройки блока CTA (часть MainPageSettings)
 */
export interface CtaSettings {
  /** Заголовок блока CTA */
  ctaTitle?: string | null;
  
  /** Описание блока CTA */
  ctaDescription?: string | null;
  
  /** Номер телефона */
  ctaPhone?: string | null;
  
  /** Текст политики конфиденциальности */
  ctaPrivacyText?: string | null;
  
  /** Фото врача */
  ctaDoctorImage?: CtaImage | null;
  
  /** Фоновое изображение */
  ctaBackgroundImage?: CtaImage | null;
}

/**
 * Fallback данные из Figma
 */
export interface CtaFigmaData {
  heading: string;
  description: string;
  phoneButton: string;
  appointmentButton: string;
  privacyText: string;
}
