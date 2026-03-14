/**
 * SearchBarWithSuggestions — поиск с live autocomplete
 *
 * - Debounce 300ms
 * - Минимум 3 символа для запроса
 * - Popover с результатами по категориям
 * - Enter → /search?q=...
 * - Клик по результату → переход на страницу
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@iconify/react";
import type { SearchResults, SearchResultItem } from "@/lib/wordpress/search";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

const TYPE_LABELS: Record<SearchResultItem["type"], string> = {
  doctor: "Врачи",
  post: "Блог",
  service: "Услуги",
  clinic: "Клиники",
  promotion: "Акции",
  page: "Страницы",
};

interface SearchBarWithSuggestionsProps {
  className?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

export function SearchBarWithSuggestions({
  className,
  placeholder = "Имплантация зубов...",
  fullWidth,
}: SearchBarWithSuggestionsProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < MIN_QUERY_LENGTH) {
      setSuggestions(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data: SearchResults = await res.json();
        setSuggestions(data);
        setIsOpen(true);
        setActiveIndex(-1);
      } else {
        setSuggestions(null);
      }
    } catch {
      setSuggestions(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (query.trim().length >= MIN_QUERY_LENGTH) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query.trim());
      }, DEBOUNCE_MS);
    } else {
      setSuggestions(null);
      setIsOpen(false);
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  const allItems = suggestions
    ? [
        ...suggestions.doctors.map((d) => ({ ...d, type: "doctor" as const })),
        ...suggestions.posts.map((d) => ({ ...d, type: "post" as const })),
        ...suggestions.services.map((d) => ({ ...d, type: "service" as const })),
        ...suggestions.clinics.map((d) => ({ ...d, type: "clinic" as const })),
        ...suggestions.promotions.map((d) => ({
          ...d,
          type: "promotion" as const,
        })),
        ...suggestions.pages.map((d) => ({ ...d, type: "page" as const })),
      ]
    : [];

  const hasResults = allItems.length > 0;
  const showPopover = isOpen && (hasResults || isLoading);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showPopover || !hasResults) {
      if (e.key === "Enter" && query.trim().length >= MIN_QUERY_LENGTH) {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i < allItems.length - 1 ? i + 1 : i));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && allItems[activeIndex]) {
          router.push(allItems[activeIndex].uri);
          setIsOpen(false);
          setQuery("");
        } else {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    router.push(item.uri);
    setIsOpen(false);
    setQuery("");
  };

  const renderGroup = (
    title: string,
    items: SearchResultItem[],
    type: SearchResultItem["type"]
  ) => {
    if (items.length === 0) return null;
    return (
      <div key={type} className="mb-3 last:mb-0">
        <p className="mb-1.5 px-2 text-xs font-medium text-unident-textGray">
          {title}
        </p>
        <ul className="space-y-0.5">
          {items.map((item, idx) => {
            const globalIndex = allItems.findIndex(
              (a) => a.id === item.id && a.type === item.type
            );
            const isActive = activeIndex === globalIndex;
            return (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  href={item.uri}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                    isActive
                      ? "bg-unident-bgElements"
                      : "hover:bg-unident-bgElements"
                  }`}
                  id={`search-result-${globalIndex}`}
                >
                  {item.featuredImage?.sourceUrl ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-unident-bgElements">
                      <Image
                        src={item.featuredImage.sourceUrl}
                        alt={item.featuredImage.altText || item.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-unident-bgElements">
                      <Icon
                        icon="mynaui:search"
                        className="h-5 w-5 text-unident-textGray"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-unident-dark">
                      {item.title}
                    </p>
                    {item.excerpt && (
                      <p className="truncate text-xs text-unident-textGray">
                        {item.excerpt.replace(/<[^>]*>/g, "").slice(0, 60)}
                        ...
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? "w-full" : "w-full"} ${className ?? ""}`}
    >
      <Popover open={showPopover} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Icon
              icon="mynaui:search"
              className="absolute left-3 top-1/2 h-[25px] w-[25px] -translate-y-1/2 text-unident-textGray"
            />
            <Input
              type="search"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.length >= MIN_QUERY_LENGTH && hasResults) {
                  setIsOpen(true);
                }
              }}
              aria-expanded={showPopover}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
              }
              className={`h-[44px] rounded-[27px] border-0 bg-unident-bgElements pl-[45px] pr-4 font-gilroy text-[clamp(0.875rem,0.82rem+0.19vw,1rem)] font-medium tracking-[-0.16px] text-unident-dark placeholder:text-unident-textGray focus-visible:ring-2 focus-visible:ring-unident-primary focus-visible:ring-offset-0 ${fullWidth ? "w-full" : "min-w-[200px] max-w-[clamp(200px,25vw,301px)] w-full min-w-0"}`}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          id="search-suggestions"
          role="listbox"
          align="start"
          sideOffset={4}
          className="search-suggestions-scroll max-h-[400px] w-[min(400px,calc(100vw-2rem))] overflow-y-auto p-2"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-unident-primary border-t-transparent" />
            </div>
          ) : suggestions ? (
            <>
              {renderGroup(
                TYPE_LABELS.doctor,
                suggestions.doctors,
                "doctor"
              )}
              {renderGroup(
                TYPE_LABELS.service,
                suggestions.services,
                "service"
              )}
              {renderGroup(
                TYPE_LABELS.clinic,
                suggestions.clinics,
                "clinic"
              )}
              {renderGroup(
                TYPE_LABELS.promotion,
                suggestions.promotions,
                "promotion"
              )}
              {renderGroup(TYPE_LABELS.post, suggestions.posts, "post")}
              {renderGroup(TYPE_LABELS.page, suggestions.pages, "page")}
              <div className="mt-2 border-t border-unident-borderGray pt-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  className="flex items-center justify-center gap-2 rounded-lg py-2 font-medium text-unident-primary hover:bg-unident-bgElements"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    setIsOpen(false);
                  }}
                >
                  Все результаты поиска
                  <Icon icon="mynaui:arrow-right" className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
