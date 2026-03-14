/**
 * MainHeader - основная строка header с логотипом, рейтингом, инфо и CTA
 * 
 * Layout из Figma:
 * - Верхняя строка: Logo | Rating | InfoBlocks (клиники, телефон, часы) | CTA кнопка
 * - Разделитель (opacity 0.2)
 * - Нижняя строка: Navigation (пункты меню + поиск)
 * 
 * PERFORMANCE: Client Component (но использует Server Components: Logo, Rating, InfoBlock)
 */

'use client';

import { Container } from '@/components/design-system/container';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Logo } from './logo';
import { Rating } from './rating';
import { InfoBlock } from './info-block';
import { Navigation } from './navigation';
import { MobileMenu } from './mobile-menu';
import type { MainHeaderProps, NavItem } from './types';
import type { ServicesDropdownData } from '@/lib/wordpress/api';

export function MainHeader({
  className,
  logoMode = 'image',
  logo,
  logoIcon,
  logoIconSvg,
  rating,
  infoBlocks = [],
  ctaText = 'Связаться с нами',
  ctaHref = '/contacts',
  navigation = [],
  searchPlaceholder,
  servicesDropdown,
  socialLinks = [],
  showAccessibilityLink = true,
  // Deprecated props (для совместимости)
  clinics,
  contactInfo,
}: MainHeaderProps & { servicesDropdown?: ServicesDropdownData }) {
  return (
    <header className={`bg-white ${className}`}>
      <Container size="xl">
        {/* Верхняя часть: mobile / tablet (2x3 grid) / desktop (viewport-based) */}
        <div className="relative max-md:px-0">
          {/* Мобильная строка: logo | hamburger */}
          <div className="flex items-center justify-between py-[15px] md:hidden">
            <Logo logoMode={logoMode} logo={logo} logoIcon={logoIcon} logoIconSvg={logoIconSvg} />
            <MobileMenu
              items={navigation}
              servicesDropdown={servicesDropdown}
              infoBlocks={infoBlocks}
              rating={rating}
              socialLinks={socialLinks}
              ctaText={ctaText}
              ctaHref={ctaHref}
              searchPlaceholder={searchPlaceholder}
              showAccessibilityLink={showAccessibilityLink}
            />
          </div>

          {/* Tablet: 2x3 grid (768–1023px) */}
          <div className="hidden md:block md:max-lg:grid md:max-lg:grid-cols-[auto_1fr_auto] md:max-lg:grid-rows-2 md:max-lg:gap-y-3 md:max-lg:gap-x-4 md:max-lg:w-full md:max-lg:py-[15px] lg:hidden">
            <div className="shrink-0 md:max-lg:col-start-1 md:max-lg:row-start-1 md:max-lg:flex md:max-lg:items-center">
              <Logo logoMode={logoMode} logo={logo} logoIcon={logoIcon} logoIconSvg={logoIconSvg} />
            </div>
            {rating && (
              <div className="md:max-lg:col-start-2 md:max-lg:row-start-1 md:max-lg:flex md:max-lg:justify-center md:max-lg:items-center">
                <Rating {...rating} />
              </div>
            )}
            {infoBlocks[0] && (
              <div className="md:max-lg:col-start-3 md:max-lg:row-start-1 md:max-lg:flex md:max-lg:justify-end">
                <InfoBlock {...infoBlocks[0]} />
              </div>
            )}
            <div className="md:max-lg:col-start-1 md:max-lg:row-start-2">
              <Button
                className="h-[44px] shrink-0 rounded-[15px] bg-unident-primary px-6 font-gilroy text-[16px] font-semibold tracking-[-0.16px] hover:bg-unident-primary/90"
                asChild
              >
                <a href={ctaHref}>{ctaText}</a>
              </Button>
            </div>
            {infoBlocks[1] && (
              <div className="md:max-lg:col-start-2 md:max-lg:row-start-2 md:max-lg:flex md:max-lg:justify-center md:max-lg:items-center">
                <InfoBlock {...infoBlocks[1]} />
              </div>
            )}
            {infoBlocks[2] && (
              <div className="md:max-lg:col-start-3 md:max-lg:row-start-2 md:max-lg:flex md:max-lg:justify-end">
                <InfoBlock {...infoBlocks[2]} />
              </div>
            )}
          </div>

          {/* Desktop: viewport-based (lg 1024px, xl 1280px) */}
          <div className="hidden lg:block w-full py-[15px]">
            <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-2 items-center gap-x-[38px] gap-y-3 xl:flex xl:flex-row xl:justify-between xl:gap-x-[38px] xl:gap-y-0">
              <div className="shrink-0 justify-self-start">
                <Logo logoMode={logoMode} logo={logo} logoIcon={logoIcon} logoIconSvg={logoIconSvg} />
              </div>
              {rating && (
                <div className="shrink-0 xl:justify-self-start">
                  <Rating {...rating} />
                </div>
              )}
              {infoBlocks[0] && (
                <div className="shrink-0 min-w-0 lg:justify-self-end xl:justify-self-start">
                  <InfoBlock {...infoBlocks[0]} />
                </div>
              )}
              {infoBlocks[1] && (
                <div className="shrink-0 min-w-0 justify-self-start xl:justify-self-start">
                  <InfoBlock {...infoBlocks[1]} />
                </div>
              )}
              {infoBlocks[2] && (
                <div className="shrink-0 min-w-0 xl:justify-self-start">
                  <InfoBlock {...infoBlocks[2]} />
                </div>
              )}
              <div className="shrink-0 justify-self-end">
                <Button
                  className="h-[44px] shrink-0 rounded-[15px] bg-unident-primary px-6 font-gilroy text-[16px] font-semibold tracking-[-0.16px] hover:bg-unident-primary/90"
                  asChild
                >
                  <a href={ctaHref}>{ctaText}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Разделительная линия */}
        <Separator className="hidden opacity-20 md:block" />

        {/* Навигация (только desktop) */}
        <Navigation 
          items={navigation} 
          searchPlaceholder={searchPlaceholder}
          servicesDropdown={servicesDropdown}
        />
      </Container>
    </header>
  );
}
