"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Countdown - компонент обратного отсчета до окончания акции
 *
 * Формат отображения:
 * - Если есть дни: "Осталось Xд Yч" (БЕЗ минут)
 * - Если нет дней, но есть часы: "Осталось Yч Zм"
 * - Если нет дней и часов: "Осталось Zм"
 * - Если время истекло: возвращает null (контейнер скрывается)
 *
 * @example
 * <Countdown endDate="2026-02-01T23:59:59" />
 */
interface CountdownProps {
  endDate: string; // ISO date string
  onExpired?: () => void;
  className?: string;
}

export function Countdown({ endDate, onExpired, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft(null);
        onExpired?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    // Вычисляем сразу
    calculateTimeLeft();

    // Обновляем каждую минуту
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [endDate, onExpired]);

  if (!timeLeft) {
    return null; // Акция истекла
  }

  // Форматируем время согласно требованиям:
  // - Если есть дни: показываем дни и часы (БЕЗ минут)
  // - Если нет дней, но есть часы: показываем часы и минуты
  // - Если нет дней и часов: показываем только минуты
  // - Если ничего не осталось: возвращаем null
  const formatCountdown = () => {
    const parts: string[] = [];

    // Если есть дни - показываем дни и часы (БЕЗ минут)
    if (timeLeft.days > 0) {
      parts.push(`${timeLeft.days}д`);
      if (timeLeft.hours > 0) {
        parts.push(`${timeLeft.hours}ч`);
      }
    }
    // Если нет дней, но есть часы - показываем часы и минуты
    else if (timeLeft.hours > 0) {
      parts.push(`${timeLeft.hours}ч`);
      if (timeLeft.minutes > 0) {
        parts.push(`${timeLeft.minutes}м`);
      }
    }
    // Если нет дней и часов, но есть минуты - показываем только минуты
    else if (timeLeft.minutes > 0) {
      parts.push(`${timeLeft.minutes}м`);
    }

    // Если все равно пусто (время истекло), возвращаем null чтобы скрыть контейнер
    if (parts.length === 0) {
      return null;
    }

    return `Осталось ${parts.join(" ")}`;
  };

  const formattedText = formatCountdown();

  if (!formattedText) {
    return null;
  }

  // Возвращаем ТОЛЬКО текст, контейнер и иконка уже в action-card.tsx
  // Стили из Figma: Gilroy Medium (500), 14px, line-height 100%, letter-spacing -1%
  return (
    <span
      className={cn(
        "font-gilroy text-[14px] font-medium leading-[100%] tracking-[-0.01em] text-[#8D8D8D]",
        className
      )}
    >
      {formattedText}
    </span>
  );
}
