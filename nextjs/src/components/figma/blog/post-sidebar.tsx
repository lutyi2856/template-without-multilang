/**
 * PostSidebar — сайдбар страницы поста блога
 *
 * Как на странице услуги: overflow-y-auto + max-h, скроллбар скрыт.
 * CTA форма (ShareButtons перенесён в левую колонку под контент).
 */

import { PostSidebarForm } from "@/components/forms/post-sidebar-form";

interface PostSidebarProps {
  ctaOverride?: {
    ctaTitle?: string | null;
    ctaDescription?: string | null;
    ctaButtonText?: string | null;
    ctaImage?: {
      sourceUrl: string;
      altText?: string;
      mediaDetails?: { width: number; height: number };
    } | null;
  } | null;
  postUrl: string;
}

export function PostSidebar({ ctaOverride, postUrl }: PostSidebarProps) {
  return (
    <div className="flex flex-col gap-6 max-h-[calc(100vh-12rem)] lg:max-h-[70vh] overflow-y-auto overscroll-contain scrollbar-hide">
      <div className="shrink-0">
        <PostSidebarForm
          title={ctaOverride?.ctaTitle || undefined}
          description={ctaOverride?.ctaDescription || undefined}
          buttonText={ctaOverride?.ctaButtonText || undefined}
        />
      </div>
    </div>
  );
}
