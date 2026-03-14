/**
 * CategoryTabs - вертикальные табы категорий услуг (левая колонка dropdown)
 * 
 * @example
 * <CategoryTabs
 *   categories={taxonomies}
 *   activeId={activeCategory}
 *   onSelect={(id) => setActiveCategory(id)}
 * />
 */

'use client';

import Link from 'next/link';
import { Text } from '@/components/design-system';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryTabsProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
  allServicesHref?: string;
}

export function CategoryTabs({ categories, activeId, onSelect, allServicesHref }: CategoryTabsProps) {
  return (
    <div
      className="category-scroll flex h-full w-[360px] max-lg:w-[220px] flex-col overflow-y-auto bg-unident-bgElements"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#526AC2 transparent',
      }}
    >
      {allServicesHref && (
        <Link
          href={allServicesHref}
          className="mt-6 flex items-center gap-2 px-[33px] py-4 text-left transition-colors hover:opacity-80"
        >
          <Text variant="category-tab" className="font-semibold text-unident-primary">
            Все услуги
          </Text>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M5.93 1.85L14.08 10L5.93 18.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
      {categories.map((category, index) => {
        const isActive = category.id === activeId;
        
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`
              px-[33px] py-4 text-left transition-all
              ${isActive 
                ? 'bg-unident-bgLightGray rounded-l-[5px]' 
                : 'opacity-50 hover:opacity-75'
              }
              ${index === 0 && !allServicesHref ? 'mt-6' : ''}
            `}
          >
            <Text 
              variant="category-tab" 
              className={`text-unident-dark ${!isActive && 'font-normal'}`}
            >
              {category.name}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
