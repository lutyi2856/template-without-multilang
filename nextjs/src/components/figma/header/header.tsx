/**
 * Header - главный компонент хэдера сайта
 * 
 * Объединяет все секции: TopBar, MainHeader, Navigation
 * Сгенерирован на основе Figma дизайна с использованием Shadcn UI
 * 
 * PERFORMANCE: Client Component (но использует Server Components: Logo, Rating, InfoBlock, SocialLinks)
 * 
 * @example
 * <Header 
 *   languages={[{ code: 'ru', label: 'Русский' }]}
 *   socialLinks={[{ name: 'Telegram', url: '#', icon: 'telegram' }]}
 *   contactInfo={{ phone: '8 999-999-99-99', workingHours: { weekdays: '10:00-22:00', weekend: '9:00-16:00' } }}
 *   rating={{ value: 5.0, source: 'Google Карты', reviewCount: 7842 }}
 *   clinics={[{ id: '1', name: 'Клиника 1', address: 'ул. Ленина, 1', metro: 'Площадь Ленина' }]}
 *   navigation={[{ id: '1', label: 'Услуги', href: '/services' }]}
 * />
 */

'use client';

import { HeaderProps } from './types';
import { cn } from '@/lib/utils';
import { TopBar } from './top-bar';
import { MainHeader } from './main-header';
import { Separator } from '@/components/ui/separator';

export function Header(props: HeaderProps) {
  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full bg-white',
        props.className
      )}
    >
      {/* Верхняя строка (скрыта на мобильных) */}
      <div className="hidden md:block">
        <TopBar
          languages={props.languages}
          currentLanguage={props.currentLanguage}
          socialLinks={props.socialLinks}
          contactInfo={props.contactInfo}
          promoText={props.promoText}
          ctaText={props.ctaText}
          ctaHref={props.ctaHref}
          showAccessibilityLink={props.showAccessibilityLink}
          showSiteMap={props.showSiteMap}
        />
      </div>

      {/* Основная строка с логотипом, рейтингом, инфо и навигацией */}
      <MainHeader
        logo={props.logoUrl ? { url: props.logoUrl } : undefined}
        rating={props.rating}
        clinics={props.clinics}
        contactInfo={props.contactInfo}
        navigation={props.navigation}
      />
    </header>
  );
}
