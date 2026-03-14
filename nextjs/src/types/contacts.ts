/**
 * TypeScript types для Contacts Settings Option Page
 *
 * Контактная информация сайта и данные страницы контактов.
 */

/**
 * Social Contact — социальная сеть (Telegram, WhatsApp и др.)
 * Структура как в HeaderSettingsSocialLink.
 */
export interface SocialContact {
  /** Название социальной сети (например: Telegram) */
  name?: string | null;
  /** Ключ иконки из iconMap или media-{ID} для пользовательских SVG */
  icon?: string | null;
  /** Inline SVG markup для пользовательских иконок из Media Library */
  iconSvg?: string | null;
  /** Ссылка на социальную сеть */
  url: string;
}

/**
 * Карточка преимущества на странице контактов
 */
export interface ContactsAdvantageItem {
  /** Ключ иконки из iconMap или media-{ID} для пользовательских SVG */
  icon?: string | null;
  /** Inline SVG markup для пользовательских иконок из Media Library */
  iconSvg?: string | null;
  /** Заголовок карточки */
  title?: string | null;
  /** Описание карточки */
  description?: string | null;
}

/**
 * Изображение для баннера контактов
 */
export interface ContactsBannerImage {
  url: string;
  width?: number | null;
  height?: number | null;
}

/**
 * Баннер на странице контактов
 */
export interface ContactsBannerData {
  /** Заголовок баннера */
  heading?: string | null;
  /** Описание / подзаголовок баннера */
  description?: string | null;
  /** Текст кнопки */
  buttonText?: string | null;
  /** Ссылка кнопки */
  buttonUrl?: string | null;
  /** Логотип / иконка баннера */
  logo?: ContactsBannerImage | null;
  /** Основное изображение баннера */
  image?: ContactsBannerImage | null;
}

/**
 * Contacts Settings — все настройки страницы контактов
 */
export interface ContactsSettings {
  /** Телефон для связи */
  phone?: string | null;
  /** Email для связи */
  email?: string | null;
  /** Социальные сети */
  socialContacts?: SocialContact[] | null;
  /** Заголовок секции карты клиник */
  mapTitle?: string | null;
  /** Заголовок блока преимуществ */
  advTitle?: string | null;
  /** Описание блока преимуществ */
  advDescription?: string | null;
  /** Карточки преимуществ */
  advItems?: ContactsAdvantageItem[] | null;
  /** Баннер контактов */
  banner?: ContactsBannerData | null;
}
