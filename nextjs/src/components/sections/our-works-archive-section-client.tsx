"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Text, Button } from "@/components/design-system";
import { OurWorksFilters } from "@/components/sections/our-works-filters";
import { CaseCard } from "@/components/figma/case";
import { Loader2 } from "lucide-react";
import type { OurWork } from "@/lib/wordpress/types/our-work";
import type { PromotionServiceCategory } from "@/lib/wordpress/api";

interface OurWorksPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface OurWorksFiltersValue {
  categorySlug?: string;
}

interface OurWorksArchiveSectionClientProps {
  initialWorks: OurWork[];
  initialPageInfo: OurWorksPageInfo;
  initialFilters: OurWorksFiltersValue;
  categories: PromotionServiceCategory[];
}

/**
 * Обёртка архива наших работ: фильтры + список.
 * При смене фильтра — router.push, сервер отдаёт новые данные.
 * «Загрузить ещё» — единственный клиентский запрос (пагинация).
 */
export function OurWorksArchiveSectionClient({
  initialWorks,
  initialPageInfo,
  initialFilters,
  categories,
}: OurWorksArchiveSectionClientProps) {
  const [works, setWorks] = useState<OurWork[]>(initialWorks);
  const [pageInfo, setPageInfo] = useState<OurWorksPageInfo>(initialPageInfo);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setWorks(initialWorks);
    setPageInfo(initialPageInfo);
  }, [initialWorks, initialPageInfo]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("our-works-scroll-y");
    if (saved !== null) {
      sessionStorage.removeItem("our-works-scroll-y");
      const y = Number(saved);
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(y, Math.max(0, maxScroll)));
    }
  }, [initialWorks, initialPageInfo]);

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
      params.set("first", "4");
      params.set("after", pageInfo.endCursor);
      if (initialFilters.categorySlug) {
        params.set("category", initialFilters.categorySlug);
      }
      const res = await fetch(`/api/our-works?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setWorks((prev) => [...prev, ...(data.works ?? [])]);
      setPageInfo(data.pageInfo ?? { hasNextPage: false, endCursor: null });
    } catch (err) {
      console.error("[OurWorksArchiveSection] loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    pageInfo.hasNextPage,
    pageInfo.endCursor,
    loadingMore,
    initialFilters.categorySlug,
  ]);

  const filteredCategories = categories.filter(
    (c) => (c.slug?.trim() ?? "") !== "" && (c.name?.trim() ?? "") !== ""
  );

  return (
    <div className="space-y-8">
      <OurWorksFilters
        categories={filteredCategories}
        worksCount={works.length}
      />

      {works.length === 0 ? (
        <div className="text-center py-12">
          <Text variant="large" className="text-unident-textGray">
            По выбранным фильтрам работы не найдены
          </Text>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {works.map((work) => (
              <CaseCard key={work.id} work={work} />
            ))}
          </div>

          {pageInfo.hasNextPage && (
            <div className="flex justify-center pt-8">
              <Button
                unidentVariant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="min-w-[200px] inline-flex items-center justify-center gap-2"
                aria-busy={loadingMore}
                aria-label={
                  loadingMore ? "Загрузка..." : "Загрузить больше"
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
                    Загрузить больше
                  </Text>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
