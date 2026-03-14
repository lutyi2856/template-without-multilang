/**
 * Icon Map - маппинг имен иконок на React компоненты
 *
 * Используется для динамического рендеринга иконок из WordPress ACF.
 * В WordPress выбирается имя иконки (Select field), на фронте
 * рендерится соответствующий React компонент.
 *
 * @example
 * // WordPress ACF: icon_name = "telegram"
 * // Next.js:
 * import { getIcon, IconName } from '@/icons/icon-map';
 * const Icon = getIcon('telegram');
 * if (Icon) <Icon className="w-6 h-6" />
 */

import type { FC, SVGProps } from "react";

// Stats/Finance иконки
import PercentIcon from "./percent.svg";
import RubleIcon from "./ruble.svg";
import InstallmentIcon from "./installment.svg";

// Social Media иконки
import WhatsAppIcon from "./whatsapp.svg";
import VKIcon from "./vk.svg";
import TelegramIcon from "./telegram.svg";
import InstagramIcon from "./instagram.svg";
import FacebookIcon from "./facebook.svg";
import GoogleIcon from "./google.svg";
import YandexIcon from "./yandex.svg";

// UI иконки
import StarIcon from "./star.svg";
import ClinicDotIcon from "./clinic-dot.svg";
import ArrowUpRightIcon from "./arrow-up-right.svg";
import MenuIcon from "./menu.svg";
import MenuLinesIcon from "./menu-lines.svg";

// Info иконки
import LocationIcon from "./location.svg";
import PhoneIcon from "./phone.svg";
import ClockIcon from "./clock.svg";

// Dental/Medical иконки
import ToothIcon from "./tooth.svg";
import ImplantIcon from "./implant.svg";
import OrthodonticsIcon from "./orthodontics.svg";
import SurgeryIcon from "./surgery.svg";
import HygieneIcon from "./hygiene.svg";
import ChildrenIcon from "./children.svg";
import AestheticIcon from "./aesthetic.svg";
import DiagnosticIcon from "./diagnostic.svg";
import WhiteningIcon from "./whitening.svg";
import ProstheticsIcon from "./prosthetics.svg";
import PeriodonticsIcon from "./periodontics.svg";
import EndodonticsIcon from "./endodontics.svg";
import KanLogoIcon from "./kan-logo.svg";

/**
 * Тип для имен иконок (должен соответствовать ACF Select choices)
 */
export type IconName =
  // Stats/Finance
  | "percent"
  | "ruble"
  | "installment"
  // Social Media
  | "whatsapp"
  | "vk"
  | "telegram"
  | "instagram"
  | "facebook"
  | "google"
  | "yandex"
  // UI
  | "star"
  | "clinic-dot"
  | "arrow-up-right"
  | "menu"
  | "menu-lines"
  // Info
  | "location"
  | "phone"
  | "clock"
  // Dental/Medical (для меню услуг)
  | "tooth"
  | "implant"
  | "orthodontics"
  | "surgery"
  | "hygiene"
  | "children"
  | "aesthetic"
  | "diagnostic"
  | "whitening"
  | "prosthetics"
  | "periodontics"
  | "endodontics"
  | "kan-logo";

/**
 * Маппинг имен иконок на React компоненты
 */
export const iconMap: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  // Stats/Finance
  percent: PercentIcon,
  ruble: RubleIcon,
  installment: InstallmentIcon,

  // Social Media
  whatsapp: WhatsAppIcon,
  vk: VKIcon,
  telegram: TelegramIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  google: GoogleIcon,
  yandex: YandexIcon,

  // UI
  star: StarIcon,
  "clinic-dot": ClinicDotIcon,
  "arrow-up-right": ArrowUpRightIcon,
  menu: MenuIcon,
  "menu-lines": MenuLinesIcon,

  // Info
  location: LocationIcon,
  phone: PhoneIcon,
  clock: ClockIcon,

  // Dental/Medical
  tooth: ToothIcon,
  implant: ImplantIcon,
  orthodontics: OrthodonticsIcon,
  surgery: SurgeryIcon,
  hygiene: HygieneIcon,
  children: ChildrenIcon,
  aesthetic: AestheticIcon,
  diagnostic: DiagnosticIcon,
  whitening: WhiteningIcon,
  prosthetics: ProstheticsIcon,
  periodontics: PeriodonticsIcon,
  endodontics: EndodonticsIcon,
  "kan-logo": KanLogoIcon,
};

/**
 * Получить иконку по имени
 *
 * @param name - имя иконки из WordPress ACF
 * @returns React компонент иконки или null
 *
 * @example
 * const Icon = getIcon('telegram');
 * if (Icon) <Icon className="w-5 h-5 text-blue-500" />
 */
export function getIcon(
  name: string | null | undefined,
): FC<SVGProps<SVGSVGElement>> | null {
  if (!name) return null;
  const normalized = name.replace(/\s+/g, "-").toLowerCase();
  return iconMap[name] ?? iconMap[normalized] ?? null;
}

/**
 * Проверить, существует ли иконка
 */
export function hasIcon(name: string | null | undefined): boolean {
  if (!name) return false;
  return name in iconMap;
}

/**
 * Получить список всех доступных иконок
 * Используется для генерации ACF Select choices
 */
export function getAvailableIcons(): string[] {
  return Object.keys(iconMap);
}

/**
 * Choices для ACF Select field
 * СКОПИРУЙ В WORDPRESS: wp-content/mu-plugins/unident-acf-fields.php
 *
 * Формат PHP:
 * 'choices' => array(
 *     'percent' => 'Процент (скидка)',
 *     'ruble' => 'Рубль',
 *     ...
 * ),
 */
export const ACF_ICON_CHOICES = {
  // === ГРУППА: Stats/Finance ===
  percent: "Процент (скидка)",
  ruble: "Рубль",
  installment: "Рассрочка",

  // === ГРУППА: Social Media ===
  whatsapp: "WhatsApp",
  vk: "VKontakte",
  telegram: "Telegram",
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google Reviews",
  yandex: "Yandex",

  // === ГРУППА: UI ===
  star: "Звезда (рейтинг)",
  "clinic-dot": "Точка (клиника)",
  "arrow-up-right": "Стрелка вправо-вверх",
  menu: "Меню (гамбургер)",
  "menu-lines": "Меню (три линии)",

  // === ГРУППА: Info ===
  location: "Локация (адрес)",
  phone: "Телефон",
  clock: "Часы (время работы)",

  // === ГРУППА: Dental/Medical ===
  tooth: "Зуб (терапия)",
  implant: "Имплант",
  orthodontics: "Ортодонтия (брекеты)",
  surgery: "Хирургия",
  hygiene: "Гигиена",
  children: "Детская стоматология",
  aesthetic: "Эстетика",
  diagnostic: "Диагностика",
  whitening: "Отбеливание",
  prosthetics: "Протезирование",
  periodontics: "Пародонтология",
  endodontics: "Эндодонтия (каналы)",
  "kan-logo": "KAN Logo",
} as const;
