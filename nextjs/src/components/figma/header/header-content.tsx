/**
 * HeaderContent - клиентский компонент для рендеринга header
 * 
 * Принимает примитивные данные из Server Component и рендерит header
 */

'use client';

import { TopBar } from './top-bar';
import { MainHeader } from './main-header';
import { LocationIcon, PhoneIcon, ClockIcon } from './header-icons';
import type { NavItem, SocialLink, Rating } from './types';
import type { ServicesDropdownData } from '@/lib/wordpress/api';

interface HeaderContentProps {
  socialLinks: SocialLink[];
  promoText: string;
  logoMode?: 'image' | 'icon';
  logo?: { url: string; alt?: string | null; width?: number | null; height?: number | null } | null;
  logoIcon?: string | null;
  logoIconSvg?: string | null;
  rating: Rating;
  // InfoBlocks data (примитивные значения)
  locationsCount: number;
  phone: string;
  phoneSchedule: string;
  workingHoursWeekdays: string;
  workingHoursWeekend: string;
  // Navigation
  navigation: NavItem[];
  searchPlaceholder: string;
  servicesDropdown: ServicesDropdownData;
}

export function HeaderContent({
  socialLinks,
  promoText,
  logoMode = 'image',
  logo,
  logoIcon,
  logoIconSvg,
  rating,
  locationsCount,
  phone,
  phoneSchedule,
  workingHoursWeekdays,
  workingHoursWeekend,
  navigation,
  searchPlaceholder,
  servicesDropdown,
}: HeaderContentProps) {
  // Создаем InfoBlocks с иконками (клиентские компоненты)
  const infoBlocks = [
    {
      icon: <LocationIcon />,
      title: `${locationsCount} клиники рядом с метро`,
      subtitle: 'Схема проезда',
      href: '/locations',
    },
    {
      icon: <PhoneIcon />,
      title: phone,
      subtitle: phoneSchedule,
      href: `tel:${phone.replace(/[^\d+]/g, '')}`,
    },
    {
      icon: <ClockIcon />,
      title: (
        <div className="flex flex-col gap-0">
          <span className="whitespace-nowrap">{workingHoursWeekdays}</span>
          <span className="whitespace-nowrap">{workingHoursWeekend}</span>
        </div>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-[9999] w-full overflow-x-hidden bg-white max-md:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
      {/* TopBar — скрыт на мобильных */}
      <div className="hidden md:block">
        <TopBar
        socialLinks={socialLinks}
        promoText={promoText}
        showAccessibilityLink={true}
        showSiteMap={true}
      />
      </div>

      {/* MainHeader */}
      <MainHeader
        logoMode={logoMode}
        logo={logo}
        logoIcon={logoIcon}
        logoIconSvg={logoIconSvg}
        rating={rating}
        infoBlocks={infoBlocks}
        ctaText="Связаться с нами"
        ctaHref="/contacts"
        navigation={navigation}
        searchPlaceholder={searchPlaceholder}
        servicesDropdown={servicesDropdown}
        socialLinks={socialLinks}
        showAccessibilityLink={true}
      />
    </header>
  );
}
