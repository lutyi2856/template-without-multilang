/**
 * Navigation - нижняя навигация с пунктами меню и поиском
 */

"use client";

import { useState, useMemo, useRef } from "react";
import { SearchBarWithSuggestions } from "./search-bar-with-suggestions";
import { NavItem } from "./nav-item";
import { NavDropdown } from "./nav-dropdown";
import { ServiceDropdown, type Service } from "./service-dropdown";
import type { Category } from "./category-tabs";
import type { FeaturedServiceCardProps } from "./featured-service-card";
import type { NavigationProps } from "./types";
import type { ServicesDropdownData } from "@/lib/wordpress/api";
import { DynamicIcon } from "@/components/dynamic-icon";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";

export function Navigation({
  className,
  items = [],
  showSearch = true,
  searchPlaceholder,
  servicesDropdown,
}: NavigationProps & { servicesDropdown?: ServicesDropdownData }) {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const servicesTriggerRef = useRef<HTMLAnchorElement>(null);

  // Преобразуем данные из WordPress в формат для компонентов
  const categories: Category[] = useMemo(() => {
    if (!servicesDropdown?.categories) return [];
    return servicesDropdown.categories.map((cat) => ({
      id: cat.databaseId.toString(),
      name: cat.name,
      slug: cat.slug,
    }));
  }, [servicesDropdown]);

  // Группируем услуги по категориям
  const servicesByCategory: Record<string, Service[]> = useMemo(() => {
    if (!servicesDropdown?.services) return {};

    const grouped: Record<string, Service[]> = {};

    servicesDropdown.services.forEach((service) => {
      // Получаем все категории услуги
      const cats = service.serviceCategories?.nodes || [];

      cats.forEach((cat) => {
        const categoryId = servicesDropdown.categories
          .find((c) => c.slug === cat.slug)
          ?.databaseId.toString();

        if (categoryId) {
          if (!grouped[categoryId]) {
            grouped[categoryId] = [];
          }

          grouped[categoryId].push({
            id: service.id,
            title: service.title,
            href: `/services/${service.slug}`,
          });
        }
      });
    });

    return grouped;
  }, [servicesDropdown]);

  // Только категории с хотя бы одной услугой (hideEmpty в WP считает все CPT)
  const categoriesWithServices: Category[] = useMemo(() => {
    return categories.filter(
      (cat) => (servicesByCategory[cat.id]?.length ?? 0) > 0,
    );
  }, [categories, servicesByCategory]);

  // Преобразуем featured service в формат FeaturedServiceCard
  const featuredService: FeaturedServiceCardProps | null = useMemo(() => {
    const featured = servicesDropdown?.featuredService;
    if (!featured) {
      return null;
    }

    // Features - теперь repeater с полем text
    const features = featured.serviceFeatures
      ? featured.serviceFeatures
          .map((f) => f?.text)
          .filter((t) => t && t.trim())
      : [];

    // Берем цену из связанного Price (первого)
    const relatedPrice = featured.relatedPrices?.[0];
    const priceValue = relatedPrice?.regularPrice || relatedPrice?.promoPrice;
    const formattedPrice = priceValue
      ? `${priceValue.toLocaleString("ru-RU")} ₽`
      : "Цена не указана";

    return {
      image:
        featured.featuredImage?.node?.sourceUrl ||
        "/images/doctors/doctor-default.png",
      title: featured.title,
      features,
      price: formattedPrice,
      buttonText: "Подробнее",
      href: featured.uri,
    };
  }, [servicesDropdown]);

  // Fallback на mock данные если нет данных из WordPress
  const hasData =
    categoriesWithServices.length > 0 &&
    Object.keys(servicesByCategory).length > 0 &&
    featuredService;

  const fallbackFeaturedService: FeaturedServiceCardProps = {
    image: "/images/doctors/doctor-1.png",
    title: "Имплант OSSTEM с установкой",
    features: [
      "высокая биосовместимость с костной тканью",
      "индивидуальный подбор модели импланта",
      "надежный южнокорейский бренд",
    ],
    price: "17 900Р",
    buttonText: "Подробнее",
    href: "/services",
  };

  return (
    <nav className={`relative hidden md:block ${className}`}>
      {/* Container убран - он уже есть в MainHeader, двойной Container создавал двойные отступы */}
      <div className="flex min-h-[60px] flex-wrap items-center justify-between gap-y-3 py-2">
        {/* Пункты навигации */}
        <div className="flex flex-wrap items-center gap-x-[clamp(1rem,0.5rem+2vw,2.5rem)] gap-y-2 flex-1 max-[1300px]:w-full max-[1300px]:justify-between">
          {items.map((item) => {
            // Специальная обработка для мега-меню (настраивается в WordPress)
            if (item.hasMegaMenu) {
              // Фильтруем категории если указаны конкретные в настройках
              const filteredCategories =
                item.megaMenuCategories && item.megaMenuCategories.length > 0
                  ? categoriesWithServices.filter((cat) =>
                      item.megaMenuCategories!.some(
                        (menuCat) => menuCat.databaseId.toString() === cat.id,
                      ),
                    )
                  : categoriesWithServices; // Если не указаны - показываем все с услугами
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setIsServicesOpen(true)}
                >
                  {/* Trigger */}
                  <a
                    ref={servicesTriggerRef}
                    href={item.href || "/services"}
                    className={cn(
                      "flex items-center gap-2 font-gilroy text-unident-dark transition-colors hover:text-unident-primary",
                      typography.figma["nav-link"]
                    )}
                    onPointerDown={(e) => {
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        e.preventDefault();
                        setIsServicesOpen((prev) => !prev);
                      }
                    }}
                    onClick={(e) => {
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {/* Icon from WordPress - rendered from icon name */}
                    {item.icon && (
                      <DynamicIcon name={item.icon} svgMarkup={item.iconSvg} className="h-5 w-5" />
                    )}
                    {item.label}
                  </a>

                  {/* ServiceDropdown */}
                  {isServicesOpen && hasData && (
                    <ServiceDropdown
                      categories={filteredCategories}
                      services={servicesByCategory}
                      featuredService={featuredService!}
                      onClose={() => setIsServicesOpen(false)}
                      triggerRef={servicesTriggerRef}
                    />
                  )}

                  {/* Fallback if no data */}
                  {isServicesOpen && !hasData && (
                    <ServiceDropdown
                      categories={
                        filteredCategories.length > 0
                          ? filteredCategories
                          : [
                              {
                                id: "1",
                                name: "Имплантация зубов",
                                slug: "implantation",
                              },
                              {
                                id: "2",
                                name: "Лечение зубов",
                                slug: "treatment",
                              },
                            ]
                      }
                      services={{}}
                      featuredService={fallbackFeaturedService}
                      onClose={() => setIsServicesOpen(false)}
                      triggerRef={servicesTriggerRef}
                    />
                  )}
                </div>
              );
            }

            // Если есть children - показываем обычный dropdown
            if (item.children && item.children.length > 0) {
              return <NavDropdown key={item.id} item={item} />;
            }
            // Иначе обычную ссылку с badge (если есть)
            return <NavItem key={item.id} item={item} />;
          })}
        </div>

        {/* Поиск */}
        {showSearch && (
          <div className="ml-auto shrink-0 flex justify-end max-[1300px]:basis-full max-[1300px]:w-full">
            <div className="min-w-[200px] max-w-[clamp(200px,25vw,301px)]">
              <SearchBarWithSuggestions placeholder={searchPlaceholder} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
