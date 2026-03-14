import Image from "next/image";
import type { ImportantBlockAttrs } from "./types";

export function ImportantBlock({
  heading,
  smallImage,
  content,
  anchorId,
  marginBottom = 40,
}: ImportantBlockAttrs) {
  if (!heading && !content) return null;

  return (
    <section
      className="overflow-hidden rounded-[25px] bg-unident-bgLightGray px-[31px] py-[22px] scroll-mt-24"
      style={{ marginBottom: `${marginBottom}px` }}
      {...(anchorId && { id: anchorId })}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          {heading && (
            <p className="font-gilroy text-[28px] font-semibold leading-[1.2] text-black">
              {heading}
            </p>
          )}
          {smallImage?.url && (
            <Image
              src={smallImage.url}
              alt={smallImage.alt || ""}
              width={smallImage.width || 40}
              height={smallImage.height || 40}
              className="h-10 w-10 flex-shrink-0 object-contain"
            />
          )}
        </div>

        {content && (
          <div
            className="font-gilroy text-[16px] font-medium leading-[1.2] text-unident-dark [&_p]:mb-0 [&_p+p]:mt-3"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  );
}
