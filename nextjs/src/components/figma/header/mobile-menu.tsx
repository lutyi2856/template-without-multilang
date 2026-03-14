/**
 * MobileMenu - мобильное меню с Sheet
 *
 * - Link вместо <a> для prefetch и клиентской навигации
 * - Accordion для вложенных пунктов (children, hasMegaMenu)
 * - Автозакрытие при смене маршрута (usePathname)
 * - CSS-анимированная кнопка-гамбургер (Menu <-> X)
 */

'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Icon } from '@iconify/react';
import { Separator } from '@/components/ui/separator';
import { DynamicIcon } from '@/components/dynamic-icon';
import { SearchBarWithSuggestions } from './search-bar-with-suggestions';
import { SocialLinks } from './social-links';
import { InfoBlock } from './info-block';
import { Rating } from './rating';
import type {
  NavItem,
  ContactInfo,
  InfoBlock as InfoBlockType,
  SocialLink,
  Rating as RatingType,
} from './types';
import type { Category } from './category-tabs';
import type { ServicesDropdownData } from '@/lib/wordpress/api';

interface Service {
  id: string;
  title: string;
  href: string;
}

interface MobileMenuProps {
  items?: NavItem[];
  contactInfo?: ContactInfo;
  infoBlocks?: InfoBlockType[];
  rating?: RatingType;
  socialLinks?: SocialLink[];
  servicesDropdown?: ServicesDropdownData;
  ctaText?: string;
  ctaHref?: string;
  searchPlaceholder?: string;
  showAccessibilityLink?: boolean;
  className?: string;
}

/** CSS-анимированная иконка гамбургер → X (тонкие полоски h-0.5 w-6) */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span
      className="relative flex h-8 w-8 flex-col items-center justify-center"
      aria-hidden
    >
      <span
        className={`absolute h-0.5 w-6 bg-current transition-all duration-300 ease-out ${
          open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-2'
        }`}
      />
      <span
        className={`absolute h-0.5 w-6 bg-current transition-all duration-300 ease-out ${
          open ? 'opacity-0' : 'top-1/2 -translate-y-1/2'
        }`}
      />
      <span
        className={`absolute h-0.5 w-6 bg-current transition-all duration-300 ease-out ${
          open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-2'
        }`}
      />
    </span>
  );
}

const navLinkClass =
  'flex items-center gap-[5px] font-gilroy text-lg font-medium text-unident-dark transition-colors hover:text-unident-primary';

export function MobileMenu({
  items = [],
  contactInfo,
  infoBlocks = [],
  rating,
  socialLinks = [],
  servicesDropdown,
  ctaText = 'Связаться с нами',
  ctaHref = '/contacts',
  searchPlaceholder = 'Имплантация зубов...',
  showAccessibilityLink = true,
  className,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Автозакрытие при смене маршрута
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Преобразуем servicesDropdown в формат для Accordion (как в Navigation)
  const { categoriesWithServices, servicesByCategory } = useMemo(() => {
    if (!servicesDropdown?.categories) {
      return { categoriesWithServices: [] as Category[], servicesByCategory: {} as Record<string, Service[]> };
    }
    const categories: Category[] = servicesDropdown.categories.map((cat) => ({
      id: cat.databaseId.toString(),
      name: cat.name,
      slug: cat.slug,
    }));

    const grouped: Record<string, Service[]> = {};
    servicesDropdown.services?.forEach((service) => {
      const cats = service.serviceCategories?.nodes || [];
      cats.forEach((cat) => {
        const categoryId = servicesDropdown.categories?.find((c) => c.slug === cat.slug)?.databaseId.toString();
        if (categoryId) {
          if (!grouped[categoryId]) grouped[categoryId] = [];
          grouped[categoryId].push({
            id: service.id,
            title: service.title,
            href: `/services/${service.slug}`,
          });
        }
      });
    });

    const categoriesWithServices = categories.filter((cat) => (grouped[cat.id]?.length ?? 0) > 0);
    return { categoriesWithServices, servicesByCategory: grouped };
  }, [servicesDropdown]);

  const isAccordionItem = (item: NavItem) =>
    (item.children && item.children.length > 0) ||
    (item.hasMegaMenu && categoriesWithServices.length > 0);

  const renderNavItem = (item: NavItem, index: number) => {
    const itemClass = `${navLinkClass} animate-in fade-in-0 slide-in-from-left-2`
      .concat(` [animation-delay:${index * 50}ms]`);

    // Пункт с мега-меню (Услуги и т.п.)
    if (item.hasMegaMenu && categoriesWithServices.length > 0) {
      const filteredCategories =
        item.megaMenuCategories && item.megaMenuCategories.length > 0
          ? categoriesWithServices.filter((cat) =>
              item.megaMenuCategories!.some((mc) => mc.databaseId.toString() === cat.id)
            )
          : categoriesWithServices;

      return (
        <AccordionItem key={item.id} value={`mega-${item.id}`} className="border-unident-borderGray">
          <AccordionTrigger className={navLinkClass}>
            <span className="flex items-center gap-[5px]">
              {item.icon && (
                <DynamicIcon name={item.icon} svgMarkup={item.iconSvg} className="h-5 w-5 shrink-0" />
              )}
              {item.label}
            </span>
            {item.badge && (
              <span className="ml-2 rounded-full bg-unident-primary px-2 py-0.5 text-xs text-white">
                {item.badge}
              </span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="mobile-menu-services-scroll max-h-[calc(100vh-200px)] overflow-y-auto overscroll-contain">
              <div className="flex flex-col gap-[10px] pl-1">
                <Link
                  href={item.href || '/services'}
                  className="font-gilroy text-base font-medium text-unident-primary hover:underline"
                >
                  Все услуги
                </Link>
                {filteredCategories.map((cat) => (
                  <div key={cat.id} className="flex flex-col gap-2">
                    <Link
                      href={`/service-category/${cat.slug}`}
                      className="block font-gilroy text-sm font-semibold text-unident-dark py-1 -my-1 transition-colors hover:text-unident-primary"
                    >
                      {cat.name}
                    </Link>
                    {(servicesByCategory[cat.id] || []).map((svc) => (
                      <Link
                        key={svc.id}
                        href={svc.href}
                        className="font-gilroy text-sm text-unident-textGray hover:text-unident-primary"
                      >
                        {svc.title}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    }

    // Пункт с children (обычный dropdown)
    if (item.children && item.children.length > 0) {
      return (
        <AccordionItem key={item.id} value={item.id} className="border-unident-borderGray">
          <AccordionTrigger className={navLinkClass}>
            <span className="flex items-center gap-[5px]">
              {item.icon && (
                <DynamicIcon name={item.icon} svgMarkup={item.iconSvg} className="h-5 w-5 shrink-0" />
              )}
              {item.label}
            </span>
            {item.badge && (
              <span className="ml-2 rounded-full bg-unident-primary px-2 py-0.5 text-xs text-white">
                {item.badge}
              </span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 pl-1">
              {item.children.map((child) => (
                <Link
                  key={child.id}
                  href={child.href || '#'}
                  className="font-gilroy text-base text-unident-textGray hover:text-unident-primary"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    }

    // Обычная ссылка
    return (
      <Link
        key={item.id}
        href={item.href || '#'}
        className={itemClass}
      >
        {item.icon && (
          <DynamicIcon name={item.icon} svgMarkup={item.iconSvg} className="h-5 w-5 shrink-0" />
        )}
        {item.label}
        {item.badge && (
          <span className="ml-2 rounded-full bg-unident-primary px-2 py-0.5 text-xs text-white">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className={`md:hidden ${className}`}>
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        >
          <HamburgerIcon open={open} />
        </Button>
        <SheetContent
          side="left"
          className="z-[10000] flex h-full w-full max-w-[100vw] flex-col overflow-x-hidden overflow-y-hidden px-6 pb-6 pt-12"
        >
          <div
            className="flex min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Верхняя часть: строка 1 — телефон слева, версия для слабовидящих справа; строка 2 — поиск */}
          <div className="flex flex-col gap-4 text-left shrink-0">
            <div className="flex flex-row items-center justify-between w-full gap-4">
              {(infoBlocks[1]?.href || contactInfo?.phone) && (
                <a
                  href={
                    infoBlocks[1]?.href ||
                    (contactInfo?.phone
                      ? `tel:${contactInfo.phone.replace(/\s/g, '')}`
                      : '#')
                  }
                  className="font-gilroy text-[15px] font-medium text-unident-dark hover:text-unident-primary shrink-0"
                >
                  {typeof infoBlocks[1]?.title === 'string'
                    ? infoBlocks[1].title
                    : contactInfo?.phone}
                </a>
              )}
              {showAccessibilityLink && (
                <button
                  type="button"
                  className="bvi-open ml-auto flex h-auto min-w-0 shrink items-center gap-[5px] bg-transparent px-0 text-[15px] font-medium text-unident-textGray transition-colors hover:text-unident-dark"
                >
                  <Icon icon="iconamoon:eye-thin" className="h-[25px] w-[25px] shrink-0" />
                  <span className="min-w-0 text-left">Версия для слабовидящих</span>
                </button>
              )}
            </div>
            <SearchBarWithSuggestions
              placeholder={searchPlaceholder}
              fullWidth
              className="w-full"
            />
          </div>

          <nav aria-label="Мобильная навигация" className="mt-6 flex flex-col gap-2">
            {items.map((item, idx) =>
              isAccordionItem(item) ? (
                <Accordion key={item.id} type="single" collapsible>
                  {renderNavItem(item, idx)}
                </Accordion>
              ) : (
                <Fragment key={item.id}>{renderNavItem(item, idx)}</Fragment>
              )
            )}
          </nav>

          {/* Нижняя часть: CTA, соцсети, время работы, клиники, Яндекс.Карта */}
          <Separator className="my-6" />
          <div className="flex flex-col gap-4">
            <Button asChild className="w-full bg-unident-primary hover:bg-unident-primary/90">
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>

            {socialLinks.length > 0 && (
              <SocialLinks
                links={socialLinks}
                size={37}
                bgColor="#F5F7F9"
                className="[&_a]:border [&_a]:border-unident-borderGray"
              />
            )}

            {(infoBlocks[2] || contactInfo?.workingHours) && (
              <div className="flex flex-col gap-1 font-gilroy text-[15px] font-medium text-unident-dark">
                {infoBlocks[2] ? (
                  infoBlocks[2].title
                ) : contactInfo?.workingHours ? (
                  <>
                    <span>{contactInfo.workingHours.weekdays} (Пн-Сб)</span>
                    {contactInfo.workingHours.weekend && (
                      <span>{contactInfo.workingHours.weekend} (Вс)</span>
                    )}
                  </>
                ) : null}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {infoBlocks[0] && <InfoBlock {...infoBlocks[0]} />}
              {rating && <Rating {...rating} />}
            </div>
          </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
