'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ServiceListProps } from '@/types';

/**
 * ServiceList - список услуг для мега-меню
 * 
 * Отображает услуги выбранной категории
 * в виде списка ссылок
 * 
 * @example
 * ```tsx
 * <ServiceList 
 *   services={services}
 *   maxItems={8}
 * />
 * ```
 */
export function ServiceList({
  services,
  maxItems = 8,
  className,
}: ServiceListProps) {
  // Ограничиваем количество услуг
  const displayServices = services.slice(0, maxItems);

  // Если нет услуг
  if (displayServices.length === 0) {
    return (
      <div className={cn('px-6 py-8 text-center', className)}>
        <p className="text-sm text-gray-500">
          Услуги в этой категории скоро появятся
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-6 gap-y-3',
        'pl-6',
        className
      )}
    >
      {displayServices.map((service) => (
        <Link
          key={service.databaseId}
          href={service.uri}
          className={cn(
            // Базовые стили
            'flex flex-col',
            'rounded-lg',
            'px-3 py-2',
            'transition-colors',
            'hover:bg-gray-50',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-unident-primary',
            'focus:ring-offset-2'
          )}
        >
          {/* Название услуги */}
          <span className="text-sm font-medium text-unident-dark line-clamp-2">
            {service.title}
          </span>

          {/* Краткое описание (если есть) */}
          {service.excerpt && (
            <span className="mt-1 text-xs text-gray-500 line-clamp-2">
              {service.excerpt.replace(/<[^>]*>/g, '').trim()}
            </span>
          )}
        </Link>
      ))}

      {/* Ссылка "Все услуги" если больше maxItems */}
      {services.length > maxItems && (
        <Link
          href="/services"
          className={cn(
            'flex items-center',
            'rounded-lg',
            'px-3 py-2',
            'text-sm font-semibold',
            'text-unident-primary',
            'hover:bg-unident-bg-light-blue',
            'transition-colors',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-unident-primary',
            'focus:ring-offset-2'
          )}
        >
          Все услуги →
        </Link>
      )}
    </div>
  );
}
