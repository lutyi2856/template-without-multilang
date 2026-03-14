/**
 * Container - адаптивный контейнер с max-width для контента
 *
 * @example
 * <Container>
 *   <h1>Content</h1>
 * </Container>
 *
 * @example с вариантом размера
 * <Container size="sm">
 *   <h1>Narrow Content</h1>
 * </Container>
 */

import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1440px]",
  full: "max-w-full",
};

export function Container({
  children,
  size = "lg",
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 md:px-[10px]",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}
