"use client";

import React, { useState, useCallback } from "react";
import { Text, Button, Container } from "@/components/design-system";
import { DoctorCard } from "@/components/figma/doctor-card";
import {
  Doctor,
  DoctorsPageInfo,
  type DoctorsFilters,
} from "@/lib/wordpress/api";
import { Loader2 } from "lucide-react";

interface DoctorsArchiveClientProps {
  initialDoctors: Doctor[];
  initialPageInfo: DoctorsPageInfo;
  filters?: DoctorsFilters;
}

/**
 * Клиентский блок архива врачей: сетка карточек + кнопка «Загрузить ещё».
 * Поддерживает фильтры по категории (service_categories) и клинике.
 */
export function DoctorsArchiveClient({
  initialDoctors,
  initialPageInfo,
  filters,
}: DoctorsArchiveClientProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [pageInfo, setPageInfo] = useState<DoctorsPageInfo>(initialPageInfo);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!pageInfo.hasNextPage || pageInfo.endCursor == null || loading) return;
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("first", "4");
      searchParams.set("after", pageInfo.endCursor);
      if (filters?.categorySlug) {
        searchParams.set("category", filters.categorySlug);
      }
      if (filters?.clinicSlug) {
        searchParams.set("clinic", filters.clinicSlug);
      }
      const url = `/api/doctors?${searchParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDoctors((prev) => [...prev, ...(data.doctors ?? [])]);
      setPageInfo(data.pageInfo ?? { hasNextPage: false, endCursor: null });
    } catch (err) {
      console.error("[DoctorsArchiveClient] loadMore error:", err);
    } finally {
      setLoading(false);
    }
  }, [pageInfo.hasNextPage, pageInfo.endCursor, loading, filters]);

  return (
    <Container size="xl">
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
            disabled={loading}
            className="min-w-[200px] inline-flex items-center justify-center gap-2"
            aria-busy={loading}
            aria-label={loading ? "Загрузка..." : "Загрузить ещё врачей"}
          >
            {loading ? (
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
    </Container>
  );
}
