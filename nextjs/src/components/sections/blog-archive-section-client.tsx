"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Text, Button } from "@/components/design-system";
import { BlogPostCard as BlogPostCardComponent } from "@/components/figma/blog/blog-post-card";
import { Loader2 } from "lucide-react";
import type { BlogPostCard, PostsPageInfo } from "@/types/blog";

interface BlogArchiveSectionClientProps {
  initialPosts: BlogPostCard[];
  initialPageInfo: PostsPageInfo;
  initialFilters: { categorySlug?: string };
  categories?: Array<{ id: string; name: string; slug: string }>;
}

/**
 * Обёртка архива блога: сетка карточек + Load More.
 * При смене фильтра (router.push) сервер отдаёт новые данные, state синхронизируется из props.
 * «Загрузить ещё» — fetch /api/posts
 */
export function BlogArchiveSectionClient({
  initialPosts,
  initialPageInfo,
  initialFilters,
}: BlogArchiveSectionClientProps) {
  const [posts, setPosts] = useState<BlogPostCard[]>(initialPosts);
  const [pageInfo, setPageInfo] = useState<PostsPageInfo>(initialPageInfo);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPosts(initialPosts);
    setPageInfo(initialPageInfo);
  }, [initialPosts, initialPageInfo]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("blog-scroll-y");
    if (saved !== null) {
      sessionStorage.removeItem("blog-scroll-y");
      const y = Number(saved);
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(y, Math.max(0, maxScroll)));
    }
  }, [initialPosts, initialPageInfo]);

  const loadMore = useCallback(async () => {
    if (!pageInfo.hasNextPage || pageInfo.endCursor == null || loadingMore)
      return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set("first", "6");
      params.set("after", pageInfo.endCursor);
      if (initialFilters.categorySlug)
        params.set("category", initialFilters.categorySlug);
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      setPageInfo(data.pageInfo ?? { hasNextPage: false, endCursor: null });
    } catch (err) {
      console.error("[BlogArchiveSection] loadMore error:", err);
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
    <div className="mt-8">
      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-[20px]">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex justify-center lg:block"
              >
                <BlogPostCardComponent
                  post={post}
                  className="max-w-[452px] w-full"
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
                className="min-w-[250px] min-h-[44px] py-4 rounded-[15px] inline-flex items-center justify-center gap-2"
                aria-busy={loadingMore}
                aria-label={
                  loadingMore ? "Загрузка..." : "Загрузить больше статей"
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
      ) : (
        <div className="py-16 text-center">
          <Text variant="large" className="text-unident-textGray">
            По выбранной категории статьи не найдены
          </Text>
          <Text variant="default" className="mt-2 text-unident-textGray">
            Попробуйте выбрать другую категорию
          </Text>
        </div>
      )}
    </div>
  );
}
