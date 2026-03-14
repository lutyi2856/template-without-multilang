'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ServiceCategoryListProps } from '@/types';

/**
 * ServiceCategoryList - список категорий услуг для мега-меню
 * 
 * Отображает список категорий с возможностью выбора
 * Подсвечивает выбранную категорию
 * 
 * @example
 * ```tsx
 * <ServiceCategoryList
 *   categories={categories}
 *   selectedCategory={selectedCategory}
 *   onSelectCategory={(cat) => setSelectedCategory(cat)}
 * />
 * ```
 */
export function ServiceCategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}: ServiceCategoryListProps) {
  return (
    <nav
      className={cn(
        'flex flex-col gap-1',
        'border-r border-gray-200',
        'pr-6',
        className
      )}
      aria-label="Категории услуг"
    >
      {categories.map((category) => {
        const isSelected = selectedCategory?.databaseId === category.databaseId;
        
        return (
          <button
            key={category.databaseId}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={cn(
              // Базовые стили
              'flex items-center justify-between gap-2',
              'rounded-lg',
              'px-4 py-3',
              'text-left',
              'transition-all',
              'focus:outline-none',
              'focus:ring-2',
              'focus:ring-unident-primary',
              'focus:ring-offset-2',
              
              // Стили в зависимости от состояния
              isSelected ? [
                'bg-unident-bg-light-blue',
                'text-unident-primary',
                'font-semibold',
              ] : [
                'bg-transparent',
                'text-unident-dark',
                'font-medium',
                'hover:bg-gray-50',
              ]
            )}
            aria-current={isSelected ? 'true' : undefined}
          >
            {/* Название категории */}
            <span className="text-base">
              {category.name}
            </span>

            {/* Счетчик услуг */}
            {category.count !== null && category.count !== undefined && category.count > 0 && (
              <span
                className={cn(
                  'text-xs',
                  isSelected ? 'text-unident-primary/70' : 'text-gray-500'
                )}
                aria-label={`${category.count} услуг`}
              >
                {category.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
