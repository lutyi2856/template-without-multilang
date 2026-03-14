"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Text, Button, Container } from "@/components/design-system";
import { PromotionCard } from "@/components/figma/promotion";
import { PromotionsFilters } from "@/components/sections/promotions-filters";
import { Loader2 } from "lucide-react";
import type { Promotion } from "@/types/promotion";
import type { CtaImage } from "@/types/main-page";

interface PromotionsPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface PromotionsFiltersValue {
  categorySlug?: string;
}

interface PromotionServiceCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
}

interface PromotionsArchiveSectionClientProps {
  initialPromotions: Promotion[];
  initialPageInfo: PromotionsPageInfo;
  initialFilters: PromotionsFiltersValue;
  categories: PromotionServiceCategory[];
  fallbackImage?: CtaImage | null;
}

/**
 * Обёртка архива акций: фильтры + список.
 * При смене фильтра — router.push, сервер отдаёт новые данные.
 * «Загрузить ещё» — единственный клиентский запрос (пагинация).
 * Сетка: 3 карточки в ряд (Figma).
 */
export function PromotionsArchiveSectionClient({
  initialPromotions,
  initialPageInfo,
  initialFilters,
  categories,
  fallbackImage = null,
}: PromotionsArchiveSectionClientProps) {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [pageInfo, setPageInfo] = useState<PromotionsPageInfo>(initialPageInfo);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPromotions(initialPromotions);
    setPageInfo(initialPageInfo);
  }, [initialPromotions, initialPageInfo]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("promotions-scroll-y");
    if (saved !== null) {
      sessionStorage.removeItem("promotions-scroll-y");
      const y = Number(saved);
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(y, Math.max(0, maxScroll)));
    }
  }, [initialPromotions, initialPageInfo]);

  const loadMore = useCallback(async () => {
    if (
      !pageInfo.hasNextPage ||
      pageInfo.endCursor == null ||
      loadingMore
    )
      return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set("first", "12");
      params.set("after", pageInfo.endCursor);
      if (initialFilters.categorySlug) {
        params.set("category", initialFilters.categorySlug);
      }
      const res = await fetch(`/api/promotions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPromotions((prev) => [...prev, ...(data.promotions ?? [])]);
      setPageInfo(data.pageInfo ?? { hasNextPage: false, endCursor: null });
    } catch (err) {
      console.error("[PromotionsArchiveSection] loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    pageInfo.hasNextPage,
    pageInfo.endCursor,
    loadingMore,
    initialFilters.categorySlug,
  ]);

  return (
    <>
      <PromotionsFilters
        categories={categories}
        promotionsCount={promotions.length}
      />

      <div className="mt-8">
        <Container size="xl">
          {promotions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    className="min-w-0 flex flex-col"
                  >
                    <PromotionCard
                      promotion={promotion}
                      fallbackImage={fallbackImage}
                      variant="archive"
                    />
                  </div>
                ))}
              </div>

              {pageInfo.hasNextPage && (
                <div className="mt-10 flex justify-center">
                  <Button
                    unidentVariant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="min-w-[200px] inline-flex items-center justify-center gap-2"
                    aria-busy={loadingMore}
                    aria-label={
                      loadingMore ? "Загрузка..." : "Загрузить ещё акций"
                    }
                  >
                    {loadingMore ? (
                      <>
                        <Loader2
                          className="h-5 w-5 shrink-0 animate-spin"
                          aria-hidden
                        />
                        <Text variant="button-text" as="span">
                          Загрузка…
                        </Text>
                      </>
                    ) : (
                      <Text variant="button-text" as="span">
                        Загрузить ещё
                      </Text>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <Text variant="large" className="text-unident-textGray">
                По выбранным фильтрам акции не найдены
              </Text>
              <Text variant="default" className="mt-2 text-unident-textGray">
                Попробуйте изменить категорию
              </Text>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
