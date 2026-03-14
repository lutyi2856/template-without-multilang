import Image from "next/image";
import Link from "next/link";
import type { ExpertOpinionBlockAttrs } from "./types";

/**
 * First two words get accent color per Figma spec.
 */
function HeadingWithAccent({ text }: { text: string }) {
  const words = text.split(/\s+/);
  if (words.length <= 2) {
    return (
      <p className="font-gilroy text-[28px] font-semibold leading-[1.2] text-unident-primary">
        {text}
      </p>
    );
  }

  const accent = words.slice(0, 2).join(" ");
  const rest = " " + words.slice(2).join(" ");

  return (
    <p className="font-gilroy text-[28px] font-semibold leading-[1.2] text-unident-dark">
      <span className="text-unident-primary">{accent}</span>
      {rest}
    </p>
  );
}

export function ExpertOpinionBlock({
  heading,
  quote,
  doctor,
  customImage,
  anchorId,
  marginBottom = 40,
}: ExpertOpinionBlockAttrs) {
  if (!heading && !quote && !doctor) return null;

  const displayImage = customImage?.url || doctor?.imageUrl || null;

  return (
    <section
      className="relative overflow-hidden rounded-[25px] bg-unident-bgLightGray scroll-mt-24"
      style={{ marginBottom: `${marginBottom}px` }}
      {...(anchorId && { id: anchorId })}
    >
      <div className="relative z-10 px-[31px] py-[22px]">
        {heading && (
          <div className="mb-4 max-w-[522px]">
            <HeadingWithAccent text={heading} />
          </div>
        )}

        {quote && (
          <p className="mb-6 max-w-[522px] font-gilroy text-[16px] font-medium italic leading-[1.2] text-unident-dark">
            {quote}
          </p>
        )}

        {doctor && (
          <Link
            href={`/doctors/${doctor.slug}`}
            className="inline-flex items-center gap-5 transition-opacity hover:opacity-80"
          >
            {doctor.imageUrl && (
              <div className="h-[75px] w-[75px] flex-shrink-0 overflow-hidden rounded-full bg-white">
                <Image
                  src={doctor.imageUrl}
                  alt={`Фото врача ${doctor.name}`}
                  width={75}
                  height={75}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex w-[230px] flex-col gap-[3px] font-gilroy font-medium leading-[1.3]">
              <span className="text-[12px] text-unident-textGray">
                Отвечает
              </span>
              <span className="text-[18px] text-unident-dark">
                {doctor.name}
              </span>
              <span className="text-[14px] text-unident-dark">
                {[doctor.specialty, doctor.experience ? `опыт ${doctor.experience}` : ""]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Right-side image (absolute, overlapping container on large screens) */}
      {displayImage && (
        <div className="hidden xl:block xl:absolute xl:right-0 xl:top-0 xl:h-full xl:w-[378px]">
          <Image
            src={displayImage}
            alt={
              customImage?.alt || (doctor ? `Фото врача ${doctor.name}` : "")
            }
            width={customImage?.width || 378}
            height={customImage?.height || 504}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </section>
  );
}
