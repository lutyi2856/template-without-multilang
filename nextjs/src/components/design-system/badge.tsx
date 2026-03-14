/**
 * Badge - универсальный компонент бейджа с вариантами
 *
 * Создан специально для УниДент (не обертка shadcn/ui).
 * Используется для отображения рейтинга, стажа и других меток.
 *
 * @example Бейдж рейтинга
 * <Badge variant="rating">
 *   4.7 ★
 * </Badge>
 *
 * @example Бейдж стажа
 * <Badge variant="experience">
 *   36 лет
 * </Badge>
 *
 * @example Default бейдж
 * <Badge variant="default">
 *   Новинка
 * </Badge>
 *
 * @example Бейдж с номером (для секции Advantages)
 * <Badge variant="number">
 *   01
 * </Badge>
 *
 * @example С дополнительными стилями
 * <Badge variant="rating" className="hover:scale-105 transition-transform">
 *   4.9 ★
 * </Badge>
 */

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "rating" | "experience" | "default" | "number" | "promotion";
  className?: string;
}

const badgeVariants = {
  rating: "bg-unident-bgLightBlue text-unident-dark",
  experience: "bg-unident-bgLightGray text-unident-dark",
  default: "bg-unident-primary text-white",
  number: "bg-unident-bgLightGray",
  promotion: "bg-unident-primary text-white",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  if (variant === "number") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center w-[65px] aspect-square min-w-[65px] rounded-[135px] font-gilroy font-medium text-[18px]",
          badgeVariants.number,
          className,
        )}
      >
        <span className="bg-gradient-to-b from-[#2E365D] to-[#46559D] bg-clip-text text-transparent">
          {children}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] font-gilroy font-medium text-sm",
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
