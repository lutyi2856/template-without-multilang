import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { ExpertKbBlockAttrs } from "./types";

export function ExpertKbBlock({
  quote,
  dataSource,
  doctor,
  manualName,
  manualUrl,
  manualSpecialties,
  manualExperience,
  displayImage,
  showPhoto = true,
  showName = true,
  showSpecialties = true,
  showExperience = true,
  urlPaid = "/zapis",
  urlOms = "",
  showPaid = true,
  showOms = false,
  marginBottom = 40,
}: ExpertKbBlockAttrs) {
  const useConnection = dataSource === "connection";
  const displayTitle = useConnection ? doctor?.name : manualName;
  const displaySpecialty = useConnection
    ? doctor?.specialty
    : manualSpecialties;
  const displayExp = useConnection ? doctor?.experience : manualExperience;
  const doctorUrl = useConnection ? doctor?.url : manualUrl;

  const hasContent = quote || displayTitle || displayImage || showPaid || showOms;
  if (!hasContent) return null;

  const specialties = displaySpecialty
    ? displaySpecialty.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <section
      className="overflow-hidden rounded-[25px] bg-unident-bgLightGray"
      style={{ marginBottom: `${marginBottom}px` }}
    >
      <div className="relative flex flex-col max-lg:gap-6 lg:flex-row">
        <div className="relative z-10 flex flex-1 flex-col justify-between p-6 md:p-8">
          {quote && (
            <div className="mb-6 max-w-[522px]">
              <p
                className={cn(
                  typography.figma["block-content-body"],
                  "font-gilroy italic text-unident-dark"
                )}
              >
                {quote}
              </p>
            </div>
          )}

          {(displayTitle || specialties.length > 0 || displayExp) && (
            <div className="mb-6 flex flex-col gap-3">
              {showName && displayTitle && (
                <div className="font-gilroy font-semibold text-unident-dark">
                  {doctorUrl ? (
                    <Link
                      href={doctorUrl}
                      className="transition-opacity hover:opacity-80"
                    >
                      {displayTitle}
                    </Link>
                  ) : (
                    displayTitle
                  )}
                </div>
              )}
              {showSpecialties && specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {specialties.map((spec) => (
                    <span
                      key={spec}
                      className="rounded-[10px] bg-unident-bgLightBlue px-3 py-1 text-[14px] font-medium text-unident-dark"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
              {showExperience && displayExp && (
                <p className="text-[14px] text-unident-textGray">
                  Стаж: {displayExp}
                </p>
              )}
            </div>
          )}

          {(showPaid || showOms) && (
            <div className="flex flex-wrap gap-3">
              {showPaid && (
                <Button asChild unidentVariant="primary">
                  <Link href={urlPaid}>Записаться платно</Link>
                </Button>
              )}
              {showOms && urlOms && (
                <Button asChild unidentVariant="primary">
                  <Link href={urlOms}>Записаться по ОМС</Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {showPhoto && displayImage?.url && (
          <div className="relative h-[300px] shrink-0 max-lg:w-full lg:h-auto lg:w-[378px]">
            <Image
              src={displayImage.url}
              alt={displayImage.alt || (displayTitle ? `Фото врача ${displayTitle}` : "Фото врача")}
              width={displayImage.width || 378}
              height={displayImage.height || 504}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
