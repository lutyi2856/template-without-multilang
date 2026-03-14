import type { Promotion } from '@/types/promotion';
import type { CtaImage } from '@/types/main-page';

/**
 * Props для PromotionCard компонента
 */
export interface PromotionCardProps {
  /** Данные акции */
  promotion: Promotion;

  /** Fallback изображение для акций без featured image */
  fallbackImage?: CtaImage | null;

  /** Вариант отображения: dark — для слайдера/главной, archive — для страницы архива */
  variant?: "dark" | "archive";
}
