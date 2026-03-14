import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Text, Heading } from '@/components/design-system';
import type { BlogPostCardProps } from './types';

const PRESETS = {
  light: {
    bg: '#F5F7F9',
    gradient: null as string | null,
    textClass: 'text-unident-dark',
    hoverClass: 'group-hover:text-unident-primary',
    dateClass: 'text-unident-dark',
    doctorLabelClass: 'text-unident-textGray',
    doctorNameClass: 'text-unident-dark hover:text-unident-primary',
  },
  dark: {
    bg: '#2E365D',
    gradient:
      'linear-gradient(180deg, rgba(46,54,93,1) 0%, rgba(70,85,157,1) 100%)',
    textClass: 'text-white',
    hoverClass: 'group-hover:text-unident-bgLightBlue',
    dateClass: 'text-white/90',
    doctorLabelClass: 'text-white/80',
    doctorNameClass: 'text-white hover:text-unident-bgLightBlue',
  },
} as const;

const CATEGORY_BG = '#FFFFFF';
const CATEGORY_TEXT = '#191E35';

/**
 * BlogPostCard — карточка поста блога.
 *
 * Два режима оформления (cardStyle: light | dark) + опциональное изображение.
 * Когда изображение есть — полупрозрачный оверлей и белый текст.
 */
export function BlogPostCard({ post, className = '' }: BlogPostCardProps) {
  const preset = PRESETS[post.cardStyle === 'dark' ? 'dark' : 'light'];
  const imageUrl = post.featuredImage?.node?.sourceUrl;
  const hasImage = Boolean(imageUrl);
  const imageAlt = post.featuredImage?.node?.altText || post.title;
  const categories = post.categories?.nodes?.slice(0, 2) ?? [];
  const doctor = post.relatedDoctors?.[0];

  const formattedDate = new Date(post.date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const cardStyle: React.CSSProperties = {};
  if (hasImage && imageUrl) {
    if (preset.gradient) {
      cardStyle.backgroundColor = preset.bg;
      cardStyle.backgroundImage = `url(${imageUrl}), ${preset.gradient}`;
      cardStyle.backgroundSize = 'cover, cover';
      cardStyle.backgroundPosition = 'center, center';
    } else {
      cardStyle.backgroundColor = preset.bg;
      cardStyle.backgroundImage = `url(${imageUrl})`;
      cardStyle.backgroundSize = 'cover';
      cardStyle.backgroundPosition = 'center';
    }
  } else if (preset.gradient) {
    cardStyle.backgroundColor = preset.bg;
    cardStyle.backgroundImage = preset.gradient;
  } else {
    cardStyle.backgroundColor = preset.bg;
  }

  const titleClass = hasImage
    ? 'text-[22px] font-semibold leading-[1.19] tracking-[-0.02em] text-white line-clamp-2 group-hover:text-unident-bgLightBlue'
    : `text-[22px] font-semibold leading-[1.19] tracking-[-0.02em] ${preset.textClass} ${preset.hoverClass} line-clamp-3`;

  const dateTextClass = hasImage
    ? 'text-white/90 text-[12.85px] leading-[1.16] mt-1'
    : `${preset.dateClass} text-[12.85px] leading-[1.16] mt-2`;

  const doctorLabelClass = hasImage
    ? 'block text-white/80 text-[12px] font-medium leading-normal'
    : `block ${preset.doctorLabelClass} text-[12px] font-medium leading-normal`;

  const doctorNameLinkClass = hasImage
    ? 'text-white text-[18px] font-medium leading-[1.3] hover:text-unident-bgLightBlue'
    : `${preset.doctorNameClass} text-[18px] font-medium leading-[1.3]`;

  const postHref = `/blog/${post.slug}`;

  return (
    <article
      className={`relative w-full min-w-0 max-w-full md:max-w-[452px] min-h-[427px] md:min-h-[487px] rounded-[25px] overflow-hidden flex flex-col transition-shadow hover:shadow-lg ${className}`}
      style={cardStyle}
    >
      {hasImage && (
        <>
          <span className="sr-only" role="img" aria-label={imageAlt} />
          <div
            className="absolute inset-0 bg-black/40 rounded-[25px] pointer-events-none"
            aria-hidden
          />
        </>
      )}

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {categories.length > 0 && (
          <div className="flex flex-col items-start gap-2 p-4 pb-0">
            {categories.map((cat) => {
              const badgeClass =
                'inline-flex items-center justify-center py-[6px] px-[15px] rounded-[10px] font-normal text-[14px] leading-[1.4] tracking-[-0.01em]';
              const badgeStyle = {
                backgroundColor: CATEGORY_BG,
                color: CATEGORY_TEXT,
              };
              return cat.slug ? (
                <Link
                  key={cat.slug}
                  href={`/blog/category/${cat.slug}`}
                  className={badgeClass}
                  style={badgeStyle}
                  aria-label={`Перейти к категории ${cat.name}`}
                >
                  {cat.name}
                </Link>
              ) : (
                <span
                  key={cat.name}
                  className={badgeClass}
                  style={badgeStyle}
                >
                  {cat.name}
                </span>
              );
            })}
          </div>
        )}

        {hasImage && <div className="flex-1 min-h-0" />}

        <div className={hasImage ? 'pt-12 pb-4 px-4' : 'p-4 pt-3'}>
          <Link href={postHref} className="group block">
            <Heading level={3} className={titleClass}>
              {post.title}
            </Heading>
          </Link>
          <Text
            variant="small"
            className={dateTextClass}
            as="span"
          >
            {formattedDate}
          </Text>
        </div>

        {!hasImage && <div className="flex-1 min-h-0" />}

        {doctor && (
          <div className="p-4 flex items-center gap-3">
            {doctor.featuredImage?.node?.sourceUrl && (
              <Image
                src={doctor.featuredImage.node.sourceUrl}
                alt={doctor.title}
                width={40}
                height={40}
                className="rounded-full object-cover flex-shrink-0"
              />
            )}
            <div>
              <span className={doctorLabelClass}>
                Отвечает врач
              </span>
              <Link
                href={`/doctors/${doctor.slug}`}
                className={doctorNameLinkClass}
              >
                {doctor.title}
              </Link>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
