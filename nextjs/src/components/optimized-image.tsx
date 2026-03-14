/**
 * OptimizedImage — обёртка над next/image с обязательным alt и fallback.
 *
 * Гарантирует, что alt никогда не будет пустым (fallback для a11y и SEO).
 * Использовать вместо next/image для изображений из WordPress.
 */
import Image, { ImageProps } from "next/image";

export interface OptimizedImageProps extends Omit<ImageProps, "alt"> {
  /** Alt текст (из WordPress altText или ACF alt) */
  alt?: string | null;
  /** Fallback при пустом alt — контекстный (например "Фото врача", "Логотип платформы") */
  fallbackAlt?: string;
}

export function OptimizedImage({
  alt,
  fallbackAlt = "Изображение",
  ...props
}: OptimizedImageProps) {
  const resolvedAlt = (alt?.trim() || fallbackAlt).trim() || "Изображение";
  return <Image alt={resolvedAlt} {...props} />;
}
