import Link from "next/link";
import { cn } from "@/lib/utils";
import { NumberedMarker } from "./numbered-marker";
import type { ListBlockAttrs } from "./types";

const CHECKMARK_SVG = (
  <svg
    width="25"
    height="25"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <rect width="25" height="25" rx="12.5" fill="#526AC2" />
    <path
      d="M6.3252 12.1988L10.6426 16.5161L18.6748 8.48389"
      stroke="white"
      strokeWidth="2"
    />
  </svg>
);

const DOT_SVG = (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <rect width="10" height="10" rx="5" fill="#526AC2" />
  </svg>
);

export function ListBlock({
  heading,
  description,
  listType,
  marker = "dot",
  items,
  anchorId,
  marginBottom = 40,
}: ListBlockAttrs) {
  if (!items || items.length === 0) return null;

  const isNumbered = listType === "numbered";
  const MarkerIcon = marker === "checkmark" ? CHECKMARK_SVG : DOT_SVG;

  return (
    <section
      className="flex flex-col gap-5 scroll-mt-24"
      style={{ marginBottom: `${marginBottom}px` }}
      {...(anchorId && { id: anchorId })}
    >
      {heading && (
        <h2 className="font-gilroy text-[28px] font-semibold leading-[1.2] text-unident-dark md:text-[36px]">
          {heading}
        </h2>
      )}

      {description && (
        <p className="font-gilroy text-[16px] font-medium leading-[1.2] text-unident-dark">
          {description}
        </p>
      )}

      <div className="flex flex-col gap-5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-5 items-start">
            {isNumbered ? (
              <NumberedMarker
                number={item.number || String(i + 1).padStart(2, "0")}
              />
            ) : (
              <span
                className={cn(
                  "flex-shrink-0 flex items-center justify-center self-start",
                  "h-[1.25em] min-h-[1.25em]",
                  marker === "checkmark" ? "w-[25px]" : "w-5"
                )}
              >
                {MarkerIcon}
              </span>
            )}

            <div className="flex flex-col">
              {item.itemHeading && (
                <p className="font-gilroy text-[18px] font-semibold leading-[1.2] text-unident-dark">
                  {item.itemHeading}
                </p>
              )}

              {item.itemDescription && (
                <div
                  className="mt-1 font-gilroy text-[16px] font-medium leading-[1.2] tracking-[-0.48px] text-unident-dark [&_p]:mb-0"
                  dangerouslySetInnerHTML={{ __html: item.itemDescription }}
                />
              )}

              {item.serviceLink && (
                <Link
                  href={`/services/${item.serviceLink.slug}`}
                  className="mt-2 inline-flex items-center gap-1.5 font-gilroy text-[14px] font-medium text-unident-primary transition-colors hover:underline"
                >
                  <span>→</span>
                  <span>{item.serviceLink.title}</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
