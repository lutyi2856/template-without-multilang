/**
 * Icons - централизованный экспорт всех SVG иконок
 *
 * @example
 * import { PercentIcon, RubleIcon, WhatsAppIcon } from '@/icons';
 *
 * <PercentIcon className="w-15 h-15" />
 * <WhatsAppIcon className="w-5 h-5 text-green-500" />
 *
 * Преимущества:
 * - Tree-shaking: только используемые иконки попадают в bundle
 * - Zero HTTP requests: иконки inline в JS
 * - TypeScript: полная типизация
 * - Стилизация: className для размера и цвета через currentColor
 */

// Stats/Finance иконки
export { default as PercentIcon } from "./percent.svg";
export { default as RubleIcon } from "./ruble.svg";
export { default as InstallmentIcon } from "./installment.svg";

// Social Media иконки
export { default as WhatsAppIcon } from "./whatsapp.svg";
export { default as VKIcon } from "./vk.svg";
export { default as TelegramIcon } from "./telegram.svg";
export { default as InstagramIcon } from "./instagram.svg";
export { default as FacebookIcon } from "./facebook.svg";
export { default as GoogleIcon } from "./google.svg";
export { default as YandexIcon } from "./yandex.svg";

// UI иконки
export { default as StarIcon } from "./star.svg";
export { default as ClinicDotIcon } from "./clinic-dot.svg";
export { default as ArrowUpRightIcon } from "./arrow-up-right.svg";
export { default as MenuIcon } from "./menu.svg";
export { default as MenuLinesIcon } from "./menu-lines.svg";

// Info иконки
export { default as LocationIcon } from "./location.svg";
export { default as PhoneIcon } from "./phone.svg";
export { default as ClockIcon } from "./clock.svg";

// Dental/Medical иконки (для меню услуг)
export { default as ToothIcon } from "./tooth.svg";
export { default as ImplantIcon } from "./implant.svg";
export { default as OrthodonticsIcon } from "./orthodontics.svg";
export { default as SurgeryIcon } from "./surgery.svg";
export { default as HygieneIcon } from "./hygiene.svg";
export { default as ChildrenIcon } from "./children.svg";
export { default as AestheticIcon } from "./aesthetic.svg";
export { default as DiagnosticIcon } from "./diagnostic.svg";
export { default as WhiteningIcon } from "./whitening.svg";
export { default as ProstheticsIcon } from "./prosthetics.svg";
export { default as PeriodonticsIcon } from "./periodontics.svg";
export { default as EndodonticsIcon } from "./endodontics.svg";
export { default as KanLogoIcon } from "./kan-logo.svg";

// Icon Map для динамического рендеринга из WordPress
export {
  getIcon,
  hasIcon,
  getAvailableIcons,
  iconMap,
  ACF_ICON_CHOICES,
} from "./icon-map";
export type { IconName } from "./icon-map";
