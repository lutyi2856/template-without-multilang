/**
 * ShareButtons — inline SVG share icons for blog post
 *
 * Figma: горизонтальная линия сверху, «Поделиться» слева, иконки прижаты к правому краю.
 * Иконки — чёрные круги, внутри белая иконка.
 *
 * SVG из Figma часто содержат inline fill/stroke — заменяем на currentColor,
 * чтобы иконка наследовала белый цвет от родителя.
 */

interface ShareButton {
  icon: string;
  url: string;
  label: string;
}

interface ShareButtonsProps {
  buttons: ShareButton[];
  postUrl: string;
}

/** Заменяет inline fill/stroke в SVG на currentColor для наследования цвета. */
function svgToCurrentColor(svg: string): string {
  return svg
    .replace(/\bfill="(?!none)([^"]*)"/g, 'fill="currentColor"')
    .replace(/\bstroke="(?!none)([^"]*)"/g, 'stroke="currentColor"')
    .replace(/\bfill='(?!none)([^']*)'/g, "fill='currentColor'")
    .replace(/\bstroke='(?!none)([^']*)'/g, "stroke='currentColor'");
}

export function ShareButtons({ buttons, postUrl }: ShareButtonsProps) {
  if (!buttons || buttons.length === 0) return null;

  const encodedUrl = encodeURIComponent(postUrl);

  return (
    <div className="flex flex-row items-center justify-between gap-4 self-stretch border-t border-unident-bgLightBlue pt-6">
      <span className="font-gilroy text-[28px] font-medium leading-[1.3] tracking-[-0.28px] text-[#141616]">
        Поделиться
      </span>
      <div className="flex flex-row items-center gap-2">
        {buttons.map((btn, idx) => {
          const href = btn.url
            .replace(/\{post_url\}/g, encodedUrl)
            .replace(/\{post_url_raw\}/g, postUrl);
          const iconHtml = svgToCurrentColor(btn.icon);

          return (
            <a
              key={idx}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Поделиться в ${btn.label}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#141616] text-white transition-opacity hover:opacity-80 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0 [&>svg]:fill-current [&>svg]:stroke-current [&>svg_*]:fill-current [&>svg_*]:stroke-current"
              dangerouslySetInnerHTML={{ __html: iconHtml }}
            />
          );
        })}
      </div>
    </div>
  );
}
