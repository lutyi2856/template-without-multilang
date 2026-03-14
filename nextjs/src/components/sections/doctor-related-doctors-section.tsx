/**
 * Секция «Другие специалисты» на странице врача
 *
 * DESIGN (Figma node 404:2914):
 * - Заголовок: «Другие специалисты»
 * - Описание: текст о профессионализме (как на главной)
 * - Кнопка «Все специалисты», слайдер: 4 карточки в ряд, листает по 1 карточке, точки = по одной на карточку
 *
 * DATA: врачи с той же категорией услуг (serviceCategories) и той же специализацией (doctorSpecializations), текущий врач исключён.
 */

import React from "react";
import { getRelatedDoctors, type Doctor } from "@/lib/wordpress/api";
import { DoctorsSectionClient } from "./doctors-section-client";

const SECTION_TITLE = "Другие специалисты";
const SECTION_DESCRIPTION =
  "Каждый наш доктор — это профессионал, который регулярно повышает свою квалификацию с помощью образовательных программ в России и зарубежом.";

interface DoctorRelatedDoctorsSectionProps {
  doctor: Doctor;
}

/**
 * Секция с карточками связанных врачей (та же категория + специализация).
 * Server Component: данные загружаются на сервере.
 */
export async function DoctorRelatedDoctorsSection({
  doctor,
}: DoctorRelatedDoctorsSectionProps) {
  const doctors = await getRelatedDoctors(doctor, 12);

  if (doctors.length === 0) {
    return null;
  }

  return (
    <DoctorsSectionClient
      doctors={doctors}
      title={SECTION_TITLE}
      description={SECTION_DESCRIPTION}
    />
  );
}
