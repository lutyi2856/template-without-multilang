/**
 * ServiceDropdown - выпадающее меню услуг (node 109:394)
 * 
 * Структура: CategoryTabs (слева) + список ссылок услуг (центр) + FeaturedServiceCard (справа)
 * Размер: full-width, height 550px, white background
 * 
 * @example
 * <ServiceDropdown
 *   categories={taxonomies}
 *   services={servicesByCategory}
 *   featuredService={promotedService}
 *   onClose={() => setIsOpen(false)}
 * />
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Text, Heading } from '@/components/design-system';
import { CategoryTabs, type Category } from './category-tabs';
import { FeaturedServiceCard, type FeaturedServiceCardProps } from './featured-service-card';

export interface Service {
  id: string;
  title: string;
  href: string;
}

export interface ServiceDropdownProps {
  categories: Category[];
  services: Record<string, Service[]>; // categoryId -> services[]
  featuredService: FeaturedServiceCardProps;
  onClose?: () => void;
  /** Ref на триггер — клик по нему не закрывает dropdown (важно для планшета) */
  triggerRef?: RefObject<HTMLElement | null>;
}

export function ServiceDropdown({
  categories,
  services,
  featuredService,
  onClose,
  triggerRef,
}: ServiceDropdownProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const activeServices = services[activeCategory] || [];
  const activeCategoryName = categories.find(c => c.id === activeCategory)?.name || '';
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  
  // Динамически вычисляем позицию
  useEffect(() => {
    const calculatePosition = () => {
      const header = document.querySelector('header');
      
      if (header) {
        const headerRect = header.getBoundingClientRect();
        const headerHeight = headerRect.height;
        const headerBottom = headerRect.bottom;
        
        // Устанавливаем CSS переменные на :root для использования в CSS
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        document.documentElement.style.setProperty('--header-bottom', `${headerBottom}px`);
        
        // Вертикальная позиция: headerBottom + 10px
        const topPosition = headerBottom + 10;
        
        // Горизонтальная позиция: на планшете left: 0, на десктопе — центрирование
        const isTablet = window.innerWidth < 1024;
        const leftPosition = isTablet ? 0 : (window.innerWidth / 2) - 1440 / 2;
        
        setPosition({ left: leftPosition, top: topPosition });
      }
    };
    
    calculatePosition();
    
    // Пересчитать только при ресайзе (scroll вызывает дергание при открытом меню)
    window.addEventListener('resize', calculatePosition);
    return () => {
      window.removeEventListener('resize', calculatePosition);
    };
  }, []);
  
  // Handle click outside to close (исключаем клик по триггеру — иначе на планшете меню закрывается сразу после открытия)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      const isOnTrigger = triggerRef?.current?.contains(target);
      if (isOutsideDropdown && !isOnTrigger) {
        onClose?.();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);
  
  // Разделяем услуги на две колонки
  const midPoint = Math.ceil(activeServices.length / 2);
  const column1 = activeServices.slice(0, midPoint);
  const column2 = activeServices.slice(midPoint);
  
  return (
    <div 
      ref={dropdownRef} 
      className="dropdown-container fixed z-[9999] flex max-h-[550px] w-[min(1440px,100vw)] max-lg:max-h-[calc(80vh-80px)] max-lg:w-screen overflow-hidden bg-white shadow-[0px_4px_51.1px_0px_rgba(181,181,181,0.19)]"
      style={{ 
        left: `${position.left}px`,
        top: `${position.top}px`
      }}
    >
      {/* Left: Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeId={activeCategory}
        onSelect={setActiveCategory}
        allServicesHref="/services"
      />
      
      {/* Center + Right: desktop — row, tablet — col (services сверху, card снизу) */}
      <div className="flex min-h-0 flex-1 overflow-hidden max-lg:flex-col">
        {/* Services List — 100% width на планшете, min-height, scroll если overflow */}
        <div className="flex min-h-0 flex-1 flex-col gap-[30px] overflow-hidden px-[33px] py-[27px] max-lg:w-full max-lg:min-h-[200px] max-lg:max-h-[400px] max-lg:flex-1 max-lg:overflow-y-auto">
          {/* Category Title + Arrow */}
          <div className="flex items-center gap-[5px] shrink-0">
            <Heading level={2} variant="category-title" className="text-unident-dark">
              {activeCategoryName}
            </Heading>
            {/* Arrow Icon - inline SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.93 1.85L14.08 10L5.93 18.15" stroke="#404040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Services List - две колонки со скроллом */}
          <div 
            className="services-scroll flex flex-1 gap-[40px] overflow-y-auto min-h-0"
            style={{
              /* Custom scrollbar - Firefox */
              scrollbarWidth: 'thin',
              scrollbarColor: '#526AC2 transparent',
            }}
          >
            {/* Column 1 */}
            <div className="flex flex-1 flex-col gap-[20px]">
              {column1.map((service) => (
                <a
                  key={service.id}
                  href={service.href}
                  className="transition-colors hover:text-unident-primary"
                >
                  <Text variant="service-item" className="text-unident-dark">
                    {service.title}
                  </Text>
                </a>
              ))}
            </div>
            
            {/* Column 2 */}
            <div className="flex flex-1 flex-col gap-[20px]">
              {column2.map((service) => (
                <a
                  key={service.id}
                  href={service.href}
                  className="transition-colors hover:text-unident-primary"
                >
                  <Text variant="service-item" className="text-unident-dark">
                    {service.title}
                  </Text>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Featured Service Card — на планшете под services */}
        <div className="@container flex shrink-0 min-w-[358px] items-center justify-center px-8 py-[50px] max-lg:min-w-0 max-lg:w-full max-lg:px-4 max-lg:py-4 max-lg:border-t max-lg:border-unident-borderGray">
          <FeaturedServiceCard {...featuredService} />
        </div>
      </div>
      
      {/* Close Button (top right) */}
      {onClose && (
        <button
          onClick={() => onClose()}
          className="absolute right-[30px] top-[20px] z-10 flex items-center gap-[5px] transition-opacity hover:opacity-70"
        >
          {/* Close Icon - inline SVG */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.48 1.48L10.52 10.52M10.52 1.48L1.48 10.52" stroke="#404040" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <Text variant="close-text" className="text-unident-dark">
            Закрыть
          </Text>
        </button>
      )}
      
      {/* Custom scrollbar styles + Smooth animation */}
      <style jsx>{`
        .dropdown-container {
          animation: dropdown-appear 0.2s ease-out;
        }
        
        @keyframes dropdown-appear {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .services-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .services-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .services-scroll::-webkit-scrollbar-thumb {
          background: #526AC2;
          border-radius: 100px;
        }
        .services-scroll::-webkit-scrollbar-thumb:hover {
          background: #4159a8;
        }
        
        .category-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .category-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .category-scroll::-webkit-scrollbar-thumb {
          background: #526AC2;
          border-radius: 100px;
        }
        .category-scroll::-webkit-scrollbar-thumb:hover {
          background: #4159a8;
        }
      `}</style>
    </div>
  );
}
