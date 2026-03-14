/**
 * TopBar - верхняя строка header с языком, ссылками, промо и соц. сетями
 */

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/design-system/container';
import { Icon } from '@iconify/react';
import { SocialLinks } from './social-links';
import type { TopBarProps } from './types';

export function TopBar({
  className,
  socialLinks,
  promoText,
  showAccessibilityLink = true,
  showSiteMap = true,
  // Deprecated props (для совместимости)
  languages,
  currentLanguage,
  contactInfo,
  ctaText,
  ctaHref,
}: TopBarProps) {
  return (
    <div className={`min-h-[50px] bg-unident-bgTopbar ${className}`}>
      <Container size="xl">
        <div className="flex min-h-[50px] flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {/* Левая часть: версия для слабовидящих + карта сайта */}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2 shrink-0">
            {showAccessibilityLink && (
              <button
                className="bvi-open flex h-auto items-center gap-[5px] bg-transparent px-0 text-[15px] font-medium text-unident-textGray transition-colors hover:text-unident-dark"
              >
                <Icon icon="iconamoon:eye-thin" className="h-[25px] w-[25px]" />
                <span>Версия для слабовидящих</span>
              </button>
            )}
            
            {showSiteMap && (
              <Button
                variant="ghost"
                className="h-auto gap-[5px] px-0 text-[15px] font-medium text-unident-textGray hover:bg-transparent hover:text-unident-dark"
                asChild
              >
                <a href="/sitemap">
                  <Icon icon="bx:map-pin" className="h-[25px] w-[25px]" />
                  <span>Карта сайта</span>
                </a>
              </Button>
            )}
          </div>

          {/* Центр: промо блок */}
          {promoText && (
            <Badge className="h-auto gap-[5px] rounded-[25px] bg-white px-[10px] py-[5px] text-[15px] font-medium text-unident-dark hover:bg-white">
              <Icon icon="fluent:sparkle-28-filled" className="h-[20px] w-[20px]" />
              <span>{promoText}</span>
            </Badge>
          )}

          {/* Правая часть: соц. сети */}
          <div className="ml-auto shrink-0 py-[10px]">
            <SocialLinks links={socialLinks} />
          </div>
        </div>
      </Container>
    </div>
  );
}
