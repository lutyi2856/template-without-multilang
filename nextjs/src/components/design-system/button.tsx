/**
 * Button - универсальный компонент кнопки с preset стилями УниДент
 *
 * Обертка над shadcn/ui Button с предустановленными вариантами
 * для стиля УниДент (цвета, скругления, шрифты).
 *
 * @example Основная кнопка
 * <Button unidentVariant="primary">Записаться</Button>
 *
 * @example Вторичная кнопка
 * <Button unidentVariant="secondary">Подробнее</Button>
 *
 * @example Outline кнопка
 * <Button unidentVariant="outline">Отменить</Button>
 *
 * @example С дополнительными стилями
 * <Button unidentVariant="primary" className="w-full">
 *   Записаться онлайн
 * </Button>
 */

import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Preset варианты для УниДент
const unidentVariants = {
  primary:
    "bg-unident-primary hover:bg-unident-primaryLight text-white font-gilroy font-semibold rounded-[15px] transition-colors",
  secondary:
    "bg-unident-bgLightGray hover:bg-unident-bgLightBlue text-unident-dark font-gilroy font-medium rounded-[15px] transition-colors",
  outline:
    "bg-transparent border-2 border-unident-primary text-unident-primary hover:bg-unident-primary hover:text-white font-gilroy font-semibold rounded-[15px] transition-colors",
};

interface ButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  unidentVariant?: keyof typeof unidentVariants;
}

export function Button({ unidentVariant, className, ...props }: ButtonProps) {
  return (
    <ShadcnButton
      className={cn(
        unidentVariant && unidentVariants[unidentVariant],
        className,
      )}
      {...props}
    />
  );
}
