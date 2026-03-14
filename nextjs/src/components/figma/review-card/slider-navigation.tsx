"use client";

import React from "react";
import Image from "next/image";

interface SliderNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  size?: "large" | "small";
  background?: "white" | "transparent" | "default";
  className?: string;
  /** Показать только стрелку «назад» (для размещения слева от карточки) */
  prevOnly?: boolean;
  /** Показать только стрелку «вперёд» (для размещения справа от карточки) */
  nextOnly?: boolean;
}

/**
 * Универсальная навигация для всех слайдеров
 *
 * DESIGN (из Figma rating блок):
 * - 2 размера стрелок:
 *   - large: 15x27px (главный слайдер отзывов)
 *   - small: 5x9px (слайдеры врачей и услуг)
 * - Disabled state (opacity 30%)
 * - Hover state (opacity 80%)
 *
 * USAGE:
 * - Главный слайдер (ReviewsSection) - size="large"
 * - Слайдер врачей (DoctorsList) - size="small"
 * - Слайдер услуг (ServicesBadges) - size="small"
 */
export function SliderNavigation({
  onPrev,
  onNext,
  canScrollPrev,
  canScrollNext,
  size = "large",
  background = "default",
  className = "",
  prevOnly = false,
  nextOnly = false,
}: SliderNavigationProps) {
  const iconSize =
    size === "large" ? { width: 15, height: 27 } : { width: 5, height: 9 };
  const leftIcon =
    size === "large"
      ? "/images/figma/review-arrow-left.svg"
      : "/images/figma/small-arrow-left.svg";
  const rightIcon =
    size === "large"
      ? "/images/figma/review-arrow-right.svg"
      : "/images/figma/small-arrow-right.svg";

  // Размеры контейнера зависят от размера иконки
  const containerPadding = size === "large" ? "p-3" : "p-1";
  const containerSize =
    size === "large" ? "w-[50px] h-[50px]" : "w-[18px] h-[18px]";

  // Стили фона и бордера зависят от размера и background prop
  let backgroundStyle: string;
  if (background === "white") {
    backgroundStyle = "bg-white border border-unident-borderGray";
  } else if (background === "transparent") {
    backgroundStyle = "bg-transparent border border-unident-borderGray";
  } else {
    // default - используем текущую логику (для совместимости со Reviews)
    backgroundStyle =
      size === "large"
        ? "bg-transparent border border-unident-borderGray"
        : "bg-unident-bgTopbar";
  }

  const buttonClass = `
    ${containerSize}
    ${containerPadding}
    ${backgroundStyle}
    rounded-full
    flex items-center justify-center
    transition-opacity
    disabled:opacity-30
    hover:opacity-80
    disabled:cursor-not-allowed
  `;

  const showPrev = !nextOnly;
  const showNext = !prevOnly;

  return (
    <div className={`flex gap-2 ${className}`}>
      {showPrev && (
        <button
          onClick={onPrev}
          disabled={!canScrollPrev}
          className={buttonClass}
          aria-label="Previous"
        >
          <Image
            src={leftIcon}
            alt=""
            width={iconSize.width}
            height={iconSize.height}
          />
        </button>
      )}
      {showNext && (
        <button
          onClick={onNext}
          disabled={!canScrollNext}
          className={buttonClass}
          aria-label="Next"
        >
          <Image
            src={rightIcon}
            alt=""
            width={iconSize.width}
            height={iconSize.height}
          />
        </button>
      )}
    </div>
  );
}
