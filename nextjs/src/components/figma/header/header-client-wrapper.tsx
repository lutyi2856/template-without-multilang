/**
 * HeaderClientWrapper - УСТАРЕВШИЙ компонент
 * 
 * НЕ ИСПОЛЬЗУЕТСЯ! Оставлен для обратной совместимости.
 * Используйте HeaderV2 вместо этого компонента.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system';
import { PromoBlock } from './promo-block';
import { Badge } from '@/components/ui/badge';
import type { Menu, HeaderSettings, ServiceCategory } from '@/types';

interface HeaderClientWrapperProps {
  menu: Menu;
  settings: HeaderSettings | null;
  categories: ServiceCategory[];
}

/**
 * HeaderClientWrapper - клиентский компонент header
 * 
 * Содержит всю интерактивную логику:
 * - Открытие/закрытие мега-меню
 * - Переключение категорий
 * - Закрытие промо-блока
 */
export function HeaderClientWrapper({
  menu,
  settings,
  categories,
}: HeaderClientWrapperProps) {
  // Состояние мега-меню
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  // Пункты меню верхнего уровня
  const menuItems = menu.menuItems?.nodes || [];

  return (
    <header className="bg-white shadow-sm">
      {/* Топ-бар с промо */}
      {settings?.featuredPromotion && (
        <div className="border-b border-gray-100 bg-gray-50">
          <Container size="xl">
            <div className="flex h-12 items-center justify-center">
              <PromoBlock promotion={settings.featuredPromotion} />
            </div>
          </Container>
        </div>
      )}

      {/* Основная шапка */}
      <Container size="xl">
        <nav className="flex h-20 items-center justify-between">
          {/* Лого */}
          <Link href="/" className="text-2xl font-bold text-unident-primary">
            УниДент
          </Link>

          {/* Меню */}
          <ul className="flex items-center gap-6">
            {menuItems.map((item) => {
              const hasMegaMenu = item.menuItemSettings?.hasMegaMenu;
              // badgeCount теперь на уровне MenuItem (dynamic resolver)
              const badgeCount = item.badgeCount;

              return (
                <li
                  key={item.databaseId}
                  className="relative"
                  onMouseEnter={() => {
                    if (hasMegaMenu) {
                      setIsMegaMenuOpen(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hasMegaMenu) {
                      setIsMegaMenuOpen(false);
                    }
                  }}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-2 text-sm font-medium text-unident-dark hover:text-unident-primary"
                  >
                    {item.label}
                    {badgeCount && badgeCount > 0 && (
                      <Badge className="bg-unident-primary text-white">
                        {badgeCount}
                      </Badge>
                    )}
                  </Link>

                  {/* Мега-меню - УДАЛЕНО, используйте HeaderV2 */}
                </li>
              );
            })}
          </ul>

          {/* Контакты */}
          <div className="flex flex-col items-end gap-1">
            {settings?.phone && (
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
                className="text-sm font-semibold text-unident-primary hover:underline"
              >
                {settings.phone}
              </a>
            )}
            {settings?.workingHours && (
              <div className="text-xs text-gray-600">
                {settings.workingHours.weekdays && (
                  <span>{settings.workingHours.weekdays}</span>
                )}
                {settings.workingHours.weekend && settings.workingHours.weekdays !== settings.workingHours.weekend && (
                  <span className="ml-2">/ {settings.workingHours.weekend}</span>
                )}
              </div>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
