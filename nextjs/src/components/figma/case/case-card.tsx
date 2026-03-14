/**
 * CaseCard - карточка кейса "До/После" с информацией о лечении
 *
 * Server Component для оптимальной производительности.
 * Включает слайдер "До/После", заголовок, врачей, услуги и клинику.
 *
 * @example
 * <CaseCard
 *   title="Тотальное преображение улыбки"
 *   beforeImage="/images/before.jpg"
 *   afterImage="/images/after.jpg"
 *   doctors={[{name: "Иванов И.И.", specialty: "Стоматолог"}]}
 *   services={["Имплантация", "Виниры"]}
 *   clinic="Клиника на Чайковского"
 * />
 */

import { Card } from "@/components/design-system/card";
import { Heading } from "@/components/design-system/heading";
import { Text } from "@/components/design-system/text";
import { BeforeAfterSlider } from "./before-after-slider";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { OurWork } from "@/lib/wordpress/types/our-work";

interface CaseCardProps {
  work: OurWork;
  className?: string;
}

export function CaseCard({ work, className = "" }: CaseCardProps) {
  const {
    title,
    photoBefore,
    photoAfter,
    generalPhoto,
    useGeneralPhoto,
    doctors,
    services,
    clinics,
  } = work;

  // Если useGeneralPhoto = true, используем общее фото для обоих сторон слайдера
  const beforeImageUrl = useGeneralPhoto
    ? generalPhoto?.sourceUrl
    : photoBefore?.sourceUrl;
  const afterImageUrl = useGeneralPhoto
    ? generalPhoto?.sourceUrl
    : photoAfter?.sourceUrl;

  // Берем первую клинику (обычно одна)
  const clinic = clinics && clinics.length > 0 ? clinics[0] : null;

  // ВРЕМЕННО: Показываем карточку даже без изображений для отладки
  // Если нет изображений, используем placeholder
  const hasImages = beforeImageUrl && afterImageUrl;

  if (!hasImages) {
    console.warn("[CaseCard] Missing images for work:", {
      id: work.id,
      title: work.title,
      useGeneralPhoto,
      hasBeforeImage: !!photoBefore,
      hasAfterImage: !!photoAfter,
      hasGeneralPhoto: !!generalPhoto,
      beforeImageUrl,
      afterImageUrl,
    });
  }

  return (
    <Card variant="default" className={cn("h-full flex flex-col", className)}>
      {/* Before/After Slider */}
      {hasImages ? (
        <div className="mb-6 w-full h-[400px] shrink-0">
          <BeforeAfterSlider
            beforeImage={beforeImageUrl!}
            afterImage={afterImageUrl!}
            beforeAlt={photoBefore?.altText || "До лечения"}
            afterAlt={photoAfter?.altText || "После лечения"}
            className="h-full"
          />
        </div>
      ) : (
        <div className="mb-6 w-full h-[400px] shrink-0 bg-unident-bgElements rounded-[25px] flex items-center justify-center">
          <p className="text-unident-textGray">Изображения не загружены</p>
        </div>
      )}

      {/* Контент */}
      <div className="flex-1 flex flex-col min-h-0 space-y-6 px-6 pb-6 max-md:px-0">
        {/* Заголовок */}
        <Heading
          level={3}
          variant="case-card-title"
          className="text-unident-dark"
        >
          {title}
        </Heading>

        {/* Информация */}
        <div className="space-y-4">
          {/* Лечащие врачи */}
          {doctors && doctors.length > 0 && (
            <div>
              <Text
                variant="case-section-label"
                className="text-unident-textGray mb-3"
              >
                Лечащие врачи
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center gap-2 min-w-0"
                  >
                    {doctor.avatar && (
                      <Image
                        src={doctor.avatar}
                        alt={doctor.name}
                        width={50}
                        height={50}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <Text
                      variant="case-doctor-name"
                      as="div"
                      className="text-unident-dark line-clamp-3"
                    >
                      {doctor.name}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Оказанные услуги */}
          {services && services.length > 0 && (
            <div>
              <Text
                variant="case-section-label"
                className="text-unident-textGray mb-3"
              >
                Оказанные услуги
              </Text>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-unident-bgElements rounded-[10px] px-4 py-3"
                  >
                    <Text variant="case-service" className="text-unident-dark">
                      {service.title}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Клиника */}
          {clinic && (
            <div>
              <Text
                variant="case-section-label"
                className="text-unident-textGray mb-2"
              >
                Клиника
              </Text>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-unident-primary" />
                <Text variant="case-clinic" as="span">
                  {clinic.title}
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
