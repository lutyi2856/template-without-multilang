"use client";

import React, { useCallback } from "react";
import { Heading, Text, Button, Container } from "@/components/design-system";
import { DoctorCard } from "@/components/figma/doctor-card";
import { SliderNavigation } from "@/components/figma/review-card/slider-navigation";
import { Doctor } from "@/lib/wordpress/api";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

interface DoctorsSectionClientProps {
  doctors: Doctor[];
  /** Заголовок секции (по умолчанию — для главной) */
  title?: string;
  /** Описание под заголовком (по умолчанию — для главной) */
  description?: string;
}

/**
 * Client обертка для DoctorsSection с Embla Carousel
 *
 * ГЛАВНЫЙ СЛАЙДЕР (Level 1):
 * - Показ 4 карточки на desktop (по дизайну Figma)
 * - 1 карточка на mobile, 2 на tablet
 * - Loop режим
 * - Стрелки навигации всегда видны
 *
 * PERFORMANCE:
 * - Client Component только для слайдера
 * - Bundle: +4KB (Embla core + autoplay plugin)
 */
const DEFAULT_TITLE = "Команда, которая помогает вам";
const DEFAULT_DESCRIPTION =
  "Каждый наш доктор — это профессионал, который регулярно повышает свою квалификацию с помощью образовательных программ в России и зарубежом.";

export function DoctorsSectionClient({
  doctors,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: DoctorsSectionClientProps) {
  const slidesCount = doctors.length; // Каждая карточка - отдельный слайд

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
    skipSnaps: false,
  });

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect, slidesCount, doctors.length]);

  return (
    <Container size="xl">
      {/* Header: Заголовок + Описание + Стрелки + Кнопка */}
      <div className="flex flex-col flex-wrap md:flex-row md:items-start md:justify-between mb-[clamp(1.875rem,1.48rem+1.69vw,3rem)] gap-6">
        {/* Левая часть: Заголовок и описание */}
        <div className="flex flex-col gap-5 flex-1">
          {/* Заголовок */}
          <Heading level={2} className="text-unident-dark">
            <Text variant="doctors-heading" as="span">
              {title}
            </Text>
          </Heading>

          {/* Описание */}
          <Text
            variant="doctors-description"
            className="text-unident-dark max-w-[600px]"
          >
            {description}
          </Text>
        </div>

        {/* Правая часть: Кнопка + Стрелки (mobile: кнопка сверху full width, стрелки ниже справа; md+: стрелки слева, кнопка справа) */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto flex-shrink-0">
          {/* Кнопка "Все специалисты" — на mobile первая, full width */}
          <Link href="/doctors" className="w-full md:w-auto md:flex-shrink-0 md:order-2">
            <Button
              unidentVariant="outline"
              className="w-full md:min-w-[160px] px-6 py-3 border border-unident-primary text-unident-primary rounded-[15px] hover:bg-unident-primary hover:text-white transition-colors"
            >
              <Text variant="doctors-button" as="span">
                Все специалисты
              </Text>
            </Button>
          </Link>

          {/* Стрелки — на mobile ниже кнопки, справа; показываем только когда есть что листать */}
          {doctors.length > 4 && (
            <SliderNavigation
              onPrev={scrollPrev}
              onNext={scrollNext}
              canScrollPrev={canScrollPrev}
              canScrollNext={canScrollNext}
              size="large"
              className="self-end md:order-1 md:self-auto"
            />
          )}
        </div>
      </div>

      {/* EMBLA CAROUSEL - Главный слайдер (показывает 4 карточки, листает по 1).
          Grid вместо flex: одинакововая высота всех карточек = высота самой высокой. */}
      <div className="min-w-0 overflow-hidden" ref={emblaRef} data-slider="doctors">
        <div className="grid grid-flow-col auto-cols-[100%] md:auto-cols-[330px] gap-6 md:gap-8 content-stretch">
          {/* Каждая карточка - отдельный элемент слайдера */}
          {doctors.map((doctor) => (
            <div key={doctor.id} className="min-w-0 flex flex-col h-full">
              <DoctorCard
                name={doctor.title}
                slug={doctor.slug}
                description={(doctor.excerpt || doctor.doctorFields?.description || "").replace(/<[^>]*>/g, "").trim()}
                specialty={
                  doctor.doctorSpecializations?.nodes?.length
                    ? doctor.doctorSpecializations.nodes.map((t) => t.name).join(", ")
                    : doctor.doctorFields?.specialization?.map((s) => s.specializationItem).filter(Boolean).join(", ") ?? ""
                }
                clinic={
                  doctor.clinic && doctor.clinic.length > 0
                    ? doctor.clinic.map((c) => c.title).join(", ")
                    : ""
                }
                clinicSlugs={
                  doctor.clinic && doctor.clinic.length > 0
                    ? doctor.clinic.map((c) => c.slug)
                    : undefined
                }
                experience={
                  doctor.doctorFields?.experience
                    ? new Date().getFullYear() -
                      new Date(doctor.doctorFields.experience).getFullYear()
                    : 0
                }
                rating={doctor.doctorFields?.rating || 0}
                ratingSource={doctor.doctorFields?.ratingSource || ""}
                imageUrl={doctor.featuredImage?.node.sourceUrl || ""}
                videoUrl={doctor.doctorFields?.videoUrl}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots — одна точка на одну карточку; показываем только когда есть прокрутка (>4 карточек на desktop) */}
      {doctors.length > 4 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: doctors.length }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? "bg-unident-primary w-6"
                  : "bg-unident-borderGray hover:bg-unident-primary/50"
              }`}
              aria-label={`Перейти к карточке ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
