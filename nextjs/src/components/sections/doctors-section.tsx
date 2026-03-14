/**
 * Секция с карточками врачей
 *
 * DESIGN (из Figma):
 * - Заголовок: "Команда, которая помогает вам 🫶" (45px, SemiBold)
 * - Описание: текст о профессионализме (18px, Regular)
 * - Кнопка "Все специалисты" (outline)
 * - Слайдер с 4 карточками на desktop
 *
 * PERFORMANCE:
 * - Server Component (без 'use client')
 * - Fetch данных из WordPress на сервере
 * - ISR: revalidate каждый час
 * - Использует DOCTOR_CARD_FIELDS (минимум полей)
 */

import React from "react";
import { getFeaturedDoctors, Doctor } from "@/lib/wordpress/api";
import { mockDoctors } from "@/components/figma/doctor-card/mock-data";
import { DoctorsSectionClient } from "./doctors-section-client";

interface DoctorsSectionProps {
  /** CSS класс для кастомизации */
  className?: string;
}

/**
 * Секция с карточками врачей для главной страницы
 * Слайдер с 4 карточками на desktop (по дизайну Figma)
 *
 * Server Component: данные загружаются на сервере с кэшированием
 */
export async function DoctorsSection({ className = "" }: DoctorsSectionProps) {
  // Fetch реальных данных из WordPress (берем больше для слайдера)
  let doctors: Doctor[] = [];

  try {
    // Берем больше врачей для слайдера (минимум 4, но может быть больше)
    doctors = await getFeaturedDoctors(12);

    // Fallback на mock данные если WordPress недоступен
    if (!doctors || doctors.length === 0) {
      console.warn("WordPress API returned empty data, using mock doctors");
      // Просто повторяем mockDoctors без скобок
      const extendedMockDoctors = [
        ...mockDoctors,
        ...mockDoctors,
        ...mockDoctors,
      ];
      doctors = extendedMockDoctors.slice(0, 12).map((mock, index) => ({
        id: `mock-${index}`,
        databaseId: index,
        title: mock.name ?? "Врач",
        slug: `doctor-${index}`,
        featuredImage: {
          node: {
            sourceUrl: mock.imageUrl ?? "",
            altText: mock.name ?? "Врач",
          },
        },
        doctorFields: {
          experience: new Date(
            new Date().getFullYear() - (mock.experience ?? 10),
            0,
            1
          ).toISOString(),
          rating: mock.rating,
          ratingSource: mock.ratingSource,
          videoUrl: mock.videoUrl,
          description: mock.description,
        },
        clinic: [
          {
            id: `clinic-${index}`,
            databaseId: index,
            title: mock.clinic ?? "Клиника",
            slug: `clinic-${index}`,
          },
        ],
      }));
    }
  } catch (error) {
    console.error("Error fetching doctors:", error);
    // Fallback на mock данные при ошибке
    // Просто повторяем mockDoctors без скобок
    const extendedMockDoctors = [
      ...mockDoctors,
      ...mockDoctors,
      ...mockDoctors,
    ];
    doctors = extendedMockDoctors.slice(0, 12).map((mock, index) => ({
      id: `mock-${index}`,
      databaseId: index,
      title: mock.name ?? "Врач",
      slug: `doctor-${index}`,
      featuredImage: {
        node: {
          sourceUrl: mock.imageUrl ?? "",
          altText: mock.name ?? "Врач",
        },
      },
      doctorFields: {
        experience: new Date(
          new Date().getFullYear() - (mock.experience ?? 10),
          0,
          1
        ).toISOString(),
        rating: mock.rating,
        ratingSource: mock.ratingSource,
        videoUrl: mock.videoUrl,
        description: mock.description,
      },
      clinic: [
        {
          id: `clinic-${index}-fallback`,
          databaseId: index + 1000,
          title: mock.clinic ?? "Клиника",
          slug: `clinic-${index}-fallback`,
        },
      ],
    }));
  }

  return (
    <section className={`py-16 bg-white ${className}`}>
      <DoctorsSectionClient doctors={doctors} />
    </section>
  );
}

// ISR: Revalidate каждый час
export const revalidate = 3600;
