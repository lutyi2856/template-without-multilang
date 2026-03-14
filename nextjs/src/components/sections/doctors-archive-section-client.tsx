"use client";

import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Text, Button, Container } from "@/components/design-system";
import { DoctorCard } from "@/components/figma/doctor-card";
import { DoctorsFilters } from "@/components/sections/doctors-filters";
import { Loader2 } from "lucide-react";

/** Local types to avoid pulling in @/lib/wordpress/api (server-only) into client bundle */
interface DoctorArchiveItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: { node: { sourceUrl: string } };
  doctorFields?: {
    experience?: string;
    rating?: number;
    ratingSource?: string;
    specialization?: Array<{ specializationItem: string }>;
    description?: string;
    videoUrl?: string;
  };
  doctorSpecializations?: { nodes: Array<{ name: string }> };
  clinic?: Array<{ title: string; slug: string }>;
}

interface DoctorsPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface DoctorsFiltersValue {
  categorySlug?: string;
  clinicSlug?: string;
}

interface DoctorServiceCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
}

interface Clinic {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
}

interface DoctorsArchiveSectionClientProps {
  initialDoctors: DoctorArchiveItem[];
  initialPageInfo: DoctorsPageInfo;
  initialFilters: DoctorsFiltersValue;
  categories: DoctorServiceCategory[];
  clinics: Clinic[];
}

/**
 * Обёртка архива врачей: фильтры + список.
 * Данные только с сервера: при смене фильтра (router.push) сервер отдаёт новые initialDoctors/initialPageInfo,
 * state синхронизируется из props — без client-side data fetching (Performance-First).
 * «Загрузить ещё» — единственный клиентский запрос (пагинация).
 */
export function DoctorsArchiveSectionClient({
  initialDoctors,
  initialPageInfo,
  initialFilters,
  categories,
  clinics,
}: DoctorsArchiveSectionClientProps) {
  const [doctors, setDoctors] = useState<DoctorArchiveItem[]>(initialDoctors);
  const [pageInfo, setPageInfo] = useState<DoctorsPageInfo>(initialPageInfo);
  const [loadingMore, setLoadingMore] = useState(false);

  // Синхронизация state с серверными данными при смене фильтра (новый RSC payload после router.push)
  useEffect(() => {
    setDoctors(initialDoctors);
    setPageInfo(initialPageInfo);
  }, [initialDoctors, initialPageInfo]);

  // Восстановление позиции скролла после смены фильтра (fallback если scroll: false не сработал)
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("doctors-scroll-y");
    if (saved !== null) {
      sessionStorage.removeItem("doctors-scroll-y");
      const y = Number(saved);
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(y, Math.max(0, maxScroll)));
    }
  }, [initialDoctors, initialPageInfo]);

  const loadMore = useCallback(async () => {
    if (!pageInfo.hasNextPage || pageInfo.endCursor == null || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set("first", "12");
      params.set("after", pageInfo.endCursor);
      if (initialFilters.categorySlug) params.set("category", initialFilters.categorySlug);
      if (initialFilters.clinicSlug) params.set("clinic", initialFilters.clinicSlug);
      const res = await fetch(`/api/doctors?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDoctors((prev) => [...prev, ...(data.doctors ?? [])]);
      setPageInfo(data.pageInfo ?? { hasNextPage: false, endCursor: null });
    } catch (err) {
      console.error("[DoctorsArchiveSection] loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [pageInfo.hasNextPage, pageInfo.endCursor, loadingMore, initialFilters.categorySlug, initialFilters.clinicSlug]);

  return (
    <>
      <DoctorsFilters
        categories={categories}
        clinics={clinics}
        doctorsCount={doctors.length}
      />

      <div className="mt-8">
        <Container size="xl">
          {doctors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="min-w-0 flex flex-col">
                    <DoctorCard
                      name={doctor.title}
                      slug={doctor.slug}
                      description={(doctor.excerpt ?? doctor.doctorFields?.description ?? "").replace(/<[^>]*>/g, "").trim()}
                      specialty={
                        doctor.doctorSpecializations?.nodes?.length
                          ? doctor.doctorSpecializations.nodes.map((t) => t.name).join(", ")
                          : doctor.doctorFields?.specialization?.map((s) => s.specializationItem).filter(Boolean).join(", ") ?? ""
                      }
                      clinic={
                        doctor.clinic?.length
                          ? doctor.clinic.map((c) => c.title).join(", ")
                          : ""
                      }
                      clinicSlugs={
                        doctor.clinic?.length
                          ? doctor.clinic.map((c) => c.slug)
                          : undefined
                      }
                      experience={
                        doctor.doctorFields?.experience
                          ? new Date().getFullYear() -
                            new Date(doctor.doctorFields.experience).getFullYear()
                          : 0
                      }
                      rating={doctor.doctorFields?.rating ?? 0}
                      ratingSource={doctor.doctorFields?.ratingSource ?? ""}
                      imageUrl={doctor.featuredImage?.node.sourceUrl ?? ""}
                      videoUrl={doctor.doctorFields?.videoUrl}
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
                    aria-label={loadingMore ? "Загрузка..." : "Загрузить ещё врачей"}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
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
                По выбранным фильтрам врачи не найдены
              </Text>
              <Text variant="default" className="mt-2 text-unident-textGray">
                Попробуйте изменить категорию или филиал
              </Text>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
