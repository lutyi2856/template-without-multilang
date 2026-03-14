/**
 * Logo - логотип из WordPress (image или icon по режиму)
 *
 * Рендерит только выбранный режим:
 * - image: logo image; при отсутствии — ничего не показывать
 * - icon: DynamicIcon при выборе; при пустом — ничего не показывать
 *
 * PERFORMANCE: Server Component (статичный контент)
 */

import Link from 'next/link';
import Image from 'next/image';
import { DynamicIcon } from '@/components/dynamic-icon';
import type { LogoProps } from './types';

export function Logo({
  className,
  logoMode = 'image',
  logo,
  logoIcon,
  logoIconSvg,
  href = '/',
  iconClassName,
}: LogoProps) {
  const hasImage = logoMode === 'image' && logo?.url;
  const hasIcon = logoMode === 'icon' && (logoIcon || logoIconSvg);
  const hasContent = hasImage || hasIcon;

  return (
    <Link
      href={href}
      className={`flex items-center gap-[10px] ${className ?? ''}`}
      aria-label={hasContent ? undefined : 'Главная'}
    >
      {hasImage && (
        <Image
          src={logo!.url}
          alt={logo!.alt ?? 'Логотип'}
          width={logo!.width ?? 153}
          height={logo!.height ?? 42}
          className="h-[30px] w-auto object-contain"
        />
      )}
      {hasIcon && (
        <DynamicIcon
          name={logoIcon ?? undefined}
          svgMarkup={logoIconSvg ?? undefined}
          className={`h-[40px] w-auto shrink-0 ${iconClassName ?? 'text-unident-dark'}`}
        />
      )}
    </Link>
  );
}
