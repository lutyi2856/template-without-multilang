/**
 * Header v2 - универсальный header с WordPress интеграцией
 * 
 * Server Component для загрузки данных из WordPress
 * Передает примитивные данные в клиентский компонент HeaderContent
 */

import { getHeaderData } from '@/lib/wordpress/api-header';
import { getCurrencySymbol } from '@/lib/currency';
import { getPromotionPrice } from '@/lib/utils/promotion-price';
import { HeaderContent } from './header-content';
import type { NavItem, SocialLink } from './types';

/**
 * Header v2 Server Component
 * 
 * Загружает данные из WordPress и маппит их в компоненты header
 */
export async function HeaderV2() {
  // Загружаем все данные для header
  let menu: Awaited<ReturnType<typeof getHeaderData>>['menu'] = null;
  let settings: Awaited<ReturnType<typeof getHeaderData>>['settings'] = null;
  let categories: Awaited<ReturnType<typeof getHeaderData>>['categories'] = [];
  let servicesDropdown: Awaited<ReturnType<typeof getHeaderData>>['servicesDropdown'];
  try {
    const data = await getHeaderData();
    menu = data.menu;
    settings = data.settings;
    categories = data.categories;
    servicesDropdown = data.servicesDropdown;
  } catch (error) {
    console.error('[HeaderV2] Error loading header data:', error);
    servicesDropdown = { categories: [], services: [], featuredService: null };
  }

  // Если данных нет - показываем упрощенный fallback
  if (!menu || !settings) {
    return (
      <header className="bg-white max-md:shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-500">
            Меню загружается...
          </p>
        </div>
      </header>
    );
  }

  // Соц. сети из WordPress (или пустой массив если не заполнены)
  const socialLinks: SocialLink[] = settings.socialLinks || [];

  // DEBUG: Логируем что пришло из WordPress
  console.log('[HeaderV2] Menu items from WordPress:', menu.menuItems?.nodes?.map(item => ({
    id: item.databaseId,
    label: item.label,
    path: item.path,
    hasChildren: !!item.childItems?.nodes?.length
  })));

  // Нормализация href: стрипим домен WordPress, убираем trailing slash
  const normalizeMenuItemHref = (path: string | undefined, label: string | undefined, url?: string): string => {
    const raw = path || url || '';
    return raw.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '#';
  };

  // Маппинг WordPress Menu → Navigation items
  const navigation: NavItem[] = menu.menuItems?.nodes?.map((item) => {
    // Определяем badgeVariant на основе типа контента (по URL/label)
    // Note: badgeCount теперь на уровне MenuItem (dynamic resolver), а не в menuItemSettings
    let badgeVariant: 'count' | 'new' | undefined;
    if (item.badgeCount) {
      const urlLower = item.url?.toLowerCase() || '';
      const labelLower = item.label?.toLowerCase() || '';
      const checkString = urlLower + ' ' + labelLower;
      
      // Для отзывов - стиль 'count' (черный шрифт без фона)
      if (
        checkString.includes('review') ||
        checkString.includes('отзыв') ||
        checkString.includes('otzyv')
      ) {
        badgeVariant = 'count';
      }
      // Для акций и остальных - стиль 'new' (с фоном)
      else {
        badgeVariant = 'new';
      }
    }

    return {
      id: item.databaseId.toString(),
      label: item.label,
      href: normalizeMenuItemHref(item.path, item.label, item.url),
      icon: item.icon || undefined,
      iconSvg: item.iconSvg || undefined,
      badge:
        item.badgeCount && item.badgeCount > 0
          ? item.badgeCount > 99
            ? '99+'
            : item.badgeCount.toString()
          : undefined,
      badgeVariant,
      hasMegaMenu: item.menuItemSettings?.hasMegaMenu || false,
      megaMenuCategories: item.megaMenuCategories || undefined,
      children: item.childItems?.nodes?.map((child) => ({
        id: child.databaseId.toString(),
        label: child.label,
        href: normalizeMenuItemHref(child.path, child.label, child.url),
        icon: child.icon || undefined,
        iconSvg: child.iconSvg || undefined,
      })) || [],
    };
  }) || [];

  // Рейтинг (данные из WordPress или статичные)
  // Note: reviewCount для рейтинга - отдельная метрика, не связана с badgeCount в меню
  const rating = {
    value: 5.0,
    maxValue: 5,
    source: 'Google Карты',
    reviewCount: 1294, // Статичное значение для рейтинга клиники
  };

  // Формируем promoText из featuredPromotion
  let promoText = '';
  const featuredPromotion = settings.featuredPromotion;

  if (featuredPromotion) {
    const relatedService =
      featuredPromotion.promotionRelationships?.relatedServices?.edges?.[0]?.node;
    const serviceTitle =
      relatedService?.title || featuredPromotion.title || 'Услуга';

    const priceData = getPromotionPrice(featuredPromotion);

    if (priceData) {
      const promoPrice = priceData.promoPrice;
      const currency = priceData.currency;
      const period = priceData.period;

      let pricePart = '';
      if (promoPrice) {
        pricePart = `${promoPrice}`;
        if (currency) pricePart += ` ${getCurrencySymbol(currency)}`;
        if (period) pricePart += `/${period}`;
      }

      promoText = pricePart ? `${serviceTitle} за ${pricePart}` : serviceTitle;
    } else {
      promoText = serviceTitle;
    }
  }

  // Передаем примитивные данные в клиентский компонент
  return (
    <HeaderContent
      socialLinks={socialLinks}
      promoText={promoText}
      logoMode={settings.logoMode ?? 'image'}
      logo={settings.logo ?? null}
      logoIcon={settings.logoIcon}
      logoIconSvg={settings.logoIconSvg}
      rating={rating}
      locationsCount={settings.locationsCount || 3}
      phone={settings.phone || '+7 (495) 123-45-67'}
      phoneSchedule={settings.phoneSchedule || 'Ежедневно с 8:00 до 10:00'}
      workingHoursWeekdays={settings.workingHours?.weekdays || '10:00-22:00'}
      workingHoursWeekend={settings.workingHours?.weekend || '9:00-16:00'}
      navigation={navigation}
      searchPlaceholder="Имплантация зубов..."
      servicesDropdown={servicesDropdown}
    />
  );
}
