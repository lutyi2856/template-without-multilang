import React from "react";
import Link from "next/link";
import { Button, Container } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { WhatsAppIcon, VKIcon, TelegramIcon } from "@/icons";
import { Logo } from "@/components/figma/header/logo";
import { SocialLinks } from "@/components/figma/header/social-links";
import { FooterNavItem } from "@/components/figma/footer/footer-nav-item";
import { getFooterData } from "@/lib/wordpress/api-footer";
import type { MenuItem } from "@/types";

/** Иконка адреса (инлайн SVG по Figma) */
function FooterAddressIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect width="38" height="38" rx="19" fill="#607BD4" />
      <path d="M19 8.48242C16.8089 8.48501 14.7083 9.35655 13.159 10.9059C11.6097 12.4552 10.7382 14.5557 10.7356 16.7468C10.7336 18.5372 11.3184 20.279 12.4005 21.7054C12.4005 21.7054 12.6259 22.0022 12.6627 22.045L19 29.519L25.3403 22.0413C25.3733 22.0014 25.5995 21.7054 25.5995 21.7054L25.6002 21.7032C26.6816 20.2772 27.2661 18.5364 27.2643 16.7468C27.2618 14.5557 26.3902 12.4552 24.8409 10.9059C23.2916 9.35655 21.191 8.48501 19 8.48242ZM19 19.752C18.4056 19.752 17.8246 19.5758 17.3304 19.2455C16.8362 18.9153 16.451 18.446 16.2235 17.8968C15.996 17.3477 15.9365 16.7435 16.0525 16.1605C16.1684 15.5775 16.4547 15.0421 16.875 14.6218C17.2952 14.2015 17.8307 13.9153 18.4137 13.7993C18.9966 13.6834 19.6009 13.7429 20.15 13.9703C20.6992 14.1978 21.1685 14.583 21.4987 15.0772C21.8289 15.5714 22.0052 16.1524 22.0052 16.7468C22.0042 17.5435 21.6873 18.3073 21.1239 18.8707C20.5605 19.4341 19.7967 19.751 19 19.752Z" fill="white" />
    </svg>
  );
}

/** Иконка телефона (инлайн SVG по Figma) */
function FooterPhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect width="38" height="38" rx="19" fill="#607BD4" />
      <path d="M26.2424 22.2665L23.698 21.976C23.3988 21.9408 23.0955 21.9739 22.811 22.0728C22.5264 22.1717 22.268 22.3338 22.0551 22.5469L20.2119 24.3902C17.3684 22.9436 15.057 20.6322 13.6104 17.7887L15.4637 15.9354C15.8944 15.5047 16.1048 14.9037 16.0346 14.2926L15.7441 11.7682C15.6876 11.2794 15.4531 10.8286 15.0855 10.5016C14.7178 10.1746 14.2427 9.99432 13.7507 9.99512H12.0177C10.8857 9.99512 9.94406 10.9368 10.0142 12.0687C10.5451 20.6236 17.387 27.4555 25.9319 27.9864C27.0638 28.0565 28.0055 27.1149 28.0055 25.9829V24.2499C28.0155 23.2381 27.2542 22.3867 26.2424 22.2665Z" fill="white" />
    </svg>
  );
}

/** Иконка часов (инлайн SVG по Figma) */
function FooterClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect width="38" height="38" rx="19" fill="#607BD4" />
      <path fillRule="evenodd" clipRule="evenodd" d="M19.7511 18.3797V12.9904H18.2485V19.0008L22.4989 23.2512L23.5608 22.1894L19.7511 18.3797ZM18.9998 29.0182C13.4672 29.0182 8.98242 24.5334 8.98242 19.0008C8.98242 13.4682 13.4672 8.9834 18.9998 8.9834C24.5325 8.9834 29.0173 13.4682 29.0173 19.0008C29.0173 24.5334 24.5325 29.0182 18.9998 29.0182Z" fill="white" />
    </svg>
  );
}

/** Колонка меню */
function FooterNavColumn({
  items,
  showIconOnFirst,
  className,
}: {
  items: MenuItem[];
  showIconOnFirst?: boolean;
  className?: string;
}) {
  if (!items?.length) return null;
  return (
    <nav className={`flex flex-col gap-3 ${className ?? ""}`} aria-label="Меню футера">
      {items.map((item, index) => (
        <FooterNavItem
          key={item.databaseId}
          item={item}
          showIcon={showIconOnFirst && index === 0}
          iconWhite
        />
      ))}
    </nav>
  );
}

/** Соцсеть по названию */
function SocialIcon({ name, url }: { name: string; url: string }) {
  const n = (name || "").toLowerCase();
  const ariaLabel = name || "Социальная сеть";
  const className = "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/30 bg-white text-unident-primary transition-colors hover:bg-white hover:text-unident-primary";
  if (n.includes("whatsapp")) {
    return (
      <a href={url} className={className} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon className="h-5 w-5" />
      </a>
    );
  }
  if (n.includes("vk") || n.includes("вконтакте")) {
    return (
      <a href={url} className={className} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
        <VKIcon className="h-5 w-5" />
      </a>
    );
  }
  if (n.includes("telegram") || n.includes("телеграм")) {
    return (
      <a href={url} className={className} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
        <TelegramIcon className="h-5 w-5" />
      </a>
    );
  }
  return (
    <a href={url} className={className} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
      <span className="text-sm font-medium">{name.slice(0, 2)}</span>
    </a>
  );
}

export interface FooterProps {
  className?: string;
}

/**
 * Footer — данные из WordPress (меню footer_left/footer_right, footerSettings, contacts, header для часов).
 * Figma: блок 392:2371, фон #2F375F, белый текст, иконки белые.
 *
 * Соцсети: только из footerSettings.socialLinks (ACF Option Page Footer).
 * Fallback на Contacts не используется — при пустом Footer показывается минимальный fallback.
 */
const FALLBACK_LEFT_LINKS = [
  { label: "Услуги", path: "/services", databaseId: 1 },
  { label: "О клинике", path: "/about", databaseId: 2 },
  { label: "Врачи", path: "/doctors", databaseId: 3 },
  { label: "Акции", path: "/promotions", databaseId: 4 },
  { label: "Кейсы", path: "/our-works", databaseId: 5 },
];
const FALLBACK_RIGHT_LINKS = [
  { label: "Цены", path: "/prices", databaseId: 6 },
  { label: "Отзывы", path: "/reviews", databaseId: 7 },
  { label: "Пациентам", path: "/patients", databaseId: 8 },
  { label: "Контакты", path: "/contacts", databaseId: 9 },
];

export async function Footer({ className = "" }: FooterProps) {
  const data = await getFooterData();
  const leftRaw = data.leftMenu?.menuItems?.nodes ?? [];
  const rightRaw = data.rightMenu?.menuItems?.nodes ?? [];
  const leftItems =
    leftRaw.length > 0 ? leftRaw : (FALLBACK_LEFT_LINKS as unknown as MenuItem[]);
  const rightItems =
    rightRaw.length > 0 ? rightRaw : (FALLBACK_RIGHT_LINKS as unknown as MenuItem[]);
  const footer = data.footerSettings;
  const contacts = data.contactsSettings;
  const header = data.headerSettings;

  const phone = contacts?.phone ?? "8 999 999-99-99";
  const phoneCaption = footer?.phoneCaption ?? header?.phoneSchedule ?? "Ежедневно с 8:00 до 10:00";
  const workingHours = footer?.workingHours ?? header?.workingHours;
  const weekdays = workingHours?.weekdays ?? "10:00 - 22:00 Пн-Сб";
  const weekend = workingHours?.weekend ?? "9:00 - 16:00 Вс";
  const addressUrl = footer?.addressSchemeUrl || "/clinics";
  const copyrightLeft = footer?.copyrightLeft ?? "2022 © ООО \"Унидент\"\nСеть стоматологических клиник \"Унидент\"\nВсе права защищены";
  const disclaimerCenter =
    footer?.disclaimerCenter ??
    "Имеются противопоказания, необходима консультация специалиста. Все права защищены. Обращаем ваше внимание на то, что данный интернет сайт носит исключительно информационный характер и ни при каких условиях не является публичной офертой, определяемой положением Статьи 437 Гражданского кодекса";

  // Соцсети из WordPress — маппинг в формат SocialLinks
  const footerSocialLinksRaw = footer?.socialLinks || [];
  const footerSocialLinks = footerSocialLinksRaw
    .filter(
      (l): l is typeof l & { name: string; url: string; icon: string } =>
        !!l.name && !!l.url && !!l.icon
    )
    .map((l) => ({ name: l.name, url: l.url, icon: l.icon, iconSvg: l.iconSvg }));

  const hasFooterLogo =
    (footer?.logoMode === "image" && footer?.logo?.url) ||
    (footer?.logoMode === "icon" && (footer?.logoIcon || footer?.logoIconSvg));
  const hasHeaderLogo =
    (header?.logoMode === "image" && header?.logo?.url) ||
    (header?.logoMode === "icon" && (header?.logoIcon || header?.logoIconSvg));

  const logoSource = hasFooterLogo ? footer : hasHeaderLogo ? header : null;
  const logoProps = logoSource
    ? {
        logoMode: (logoSource.logoMode ?? "image") as "image" | "icon",
        logo: logoSource.logo ?? null,
        logoIcon: logoSource.logoIcon ?? null,
        logoIconSvg: logoSource.logoIconSvg ?? null,
      }
    : null;

  return (
    <footer className={`bg-unident-footer text-white ${className}`}>
      <Container size="xl" className="py-12">
        {/* Первая строка: только логотип */}
        <div className="mb-8">
          {logoProps ? (
            <Logo
              {...logoProps}
              className="h-8 w-auto text-white min-h-[44px]"
              iconClassName="text-white"
            />
          ) : (
            <Link href="/" className="inline-flex items-center gap-3 text-white min-h-[44px]">
              <svg
                width="22"
                height="34"
                viewBox="0 0 22 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-auto shrink-0"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.180961 5.79834C0.0222192 5.89891 -0.0244197 6.3541 0.011365 7.44935L0.0607149 8.9613L1.44462 9.01031C2.2714 9.03965 2.89313 9.14209 2.98912 9.2647C3.07731 9.37765 3.24098 9.96615 3.35274 10.5725C3.84881 13.2655 5.03326 16.0423 6.68784 18.3915C8.79472 21.3827 11.0074 23.2733 14.3068 24.9009C16.716 26.0896 18.2288 26.5635 20.614 26.8769C22.7141 27.1528 22.7399 27.1292 22.6877 24.9991C22.6658 24.1069 22.5744 23.2816 22.4845 23.1649C22.3946 23.0484 22.07 22.9529 21.7632 22.9529C19.8342 22.9529 16.3346 21.723 14.1592 20.2805C11.9356 18.806 9.78771 16.3119 8.50082 13.71C7.92046 12.5365 7.02126 9.47856 7.18068 9.22061C7.25005 9.10834 8.85663 9.04609 11.688 9.04609C15.7614 9.04609 16.0882 9.02405 16.0968 8.7493C16.1406 7.36845 16.0982 5.97811 16.0076 5.83175C15.8748 5.61687 0.517948 5.58448 0.180961 5.79834Z"
                  fill="currentColor"
                />
              </svg>
              <span className={typography.figma["footer-logo"] + " font-gilroy text-white"}>
                УниДент
              </span>
            </Link>
          )}
        </div>

        {/* Вторая строка: группа меню слева, контакты справа — стек на мобильных */}
        <div className="mb-8 flex flex-col flex-wrap gap-8 md:flex-row md:items-start md:justify-between md:gap-x-4 md:gap-y-6">
          <div className="flex flex-row flex-wrap gap-x-[18px] gap-y-4 max-md:flex-col max-md:gap-6">
            <FooterNavColumn items={leftItems} showIconOnFirst className="w-full min-w-0 max-md:w-full md:w-auto md:min-w-[180px] md:max-w-[217px]" />
            <FooterNavColumn items={rightItems} className="w-full min-w-0 max-md:w-full md:w-auto md:min-w-[180px] md:max-w-[208px]" />
          </div>
          <div className="flex flex-col flex-wrap gap-6 md:flex-col lg:flex-row lg:gap-6 lg:shrink-0">
            <div className="space-y-6 w-full min-w-0 lg:flex-1 lg:min-w-0">
              <Link
                href={addressUrl}
                className="flex items-start gap-3 text-white/90 hover:text-white transition-colors"
              >
                <FooterAddressIcon className="mt-1 h-[38px] w-[38px] shrink-0" />
                <div>
                  <div className="font-medium">Адрес</div>
                  <div className="text-sm text-white/70">Схема проезда</div>
                </div>
              </Link>

              <div className="flex items-start gap-3">
                <FooterPhoneIcon className="mt-1 h-[38px] w-[38px] shrink-0" />
                <div>
                  <a href={`tel:${phone.replace(/\D/g, "")}`} className="block font-medium hover:text-white/90">
                    {phone}
                  </a>
                  <div className="text-sm text-white/70">{phoneCaption}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FooterClockIcon className="mt-1 h-[38px] w-[38px] shrink-0" />
                <div>
                  <div className="font-medium">{weekdays}</div>
                  <div className="font-medium text-white/80">{weekend}</div>
                </div>
              </div>

              {footerSocialLinks.length > 0 ? (
                <SocialLinks
                  links={footerSocialLinks}
                  size={45}
                  className="flex flex-wrap gap-3"
                  bgColor="white"
                  hoverInvert
                />
              ) : (
                <div className="flex flex-wrap gap-3">
                  <SocialIcon name="WhatsApp" url="https://wa.me/79999999999" />
                  <SocialIcon name="VK" url="https://vk.com/unident" />
                  <SocialIcon name="Telegram" url="https://t.me/unident" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                unidentVariant="outline"
                className="rounded-lg border-2 border-white bg-transparent px-6 py-3 text-white hover:bg-white hover:text-unident-footer"
                asChild
              >
                <Link href="/contacts">Связаться с нами</Link>
              </Button>
              <Button
                unidentVariant="outline"
                className="rounded-lg border-2 border-white bg-transparent px-6 py-3 text-white hover:bg-white hover:text-unident-footer"
                asChild
              >
                <Link href="/contacts#zapis">Записаться на прием</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="my-8 h-px bg-white/20" />

        <div className="flex flex-col flex-wrap gap-6 md:flex-row md:items-start md:justify-between md:gap-x-4 md:gap-y-6 text-sm text-white/50">
          <div className="min-w-0 max-w-full md:max-w-[300px] whitespace-pre-line">{copyrightLeft}</div>
          <div className="min-w-0 max-w-full md:max-w-[600px] md:flex-1 leading-relaxed">{disclaimerCenter}</div>
          <div className="shrink-0 text-left">
            <Link href="/privacy" className="block hover:text-white">
              Политика конфиденциальности
            </Link>
            <Link href="/licenses-legal" className="mt-1 block hover:text-white">
              Лицензии и правовая информация
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
