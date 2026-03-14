import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import { NumberedMarker } from "./numbered-marker";
import type { NumberedListBlockAttrs } from "./types";

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

export function NumberedListBlock({
  title,
  h3,
  h4,
  description,
  listType,
  marker = "checkmark",
  items,
  marginBottom = 40,
}: NumberedListBlockAttrs) {
  if (!items || items.length === 0) return null;

  const isNumbered = listType === "numbered";
  const MarkerIcon = marker === "checkmark" ? CHECKMARK_SVG : DOT_SVG;

  return (
    <section
      className="flex flex-col gap-5"
      style={{ marginBottom: `${marginBottom}px` }}
    >
      {title && (
        <Heading level={2} className={cn(typography.figma["block-content-title"])}>
          {title}
        </Heading>
      )}
      {h3 && (
        <Heading level={3} className={cn(typography.figma["block-content-title"])}>
          {h3}
        </Heading>
      )}
      {h4 && (
        <Heading level={4} className={cn(typography.figma["block-content-title"])}>
          {h4}
        </Heading>
      )}
      {description && (
        <div
          className={cn(typography.figma["block-content-body"], "text-unident-dark prose prose-ul:pl-5 prose-li:marker:text-unident-primary max-w-none")}
          dangerouslySetInnerHTML={{ __html: description }}
        />
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
            <Text
              variant="block-list-item"
              className="text-unident-dark flex-1"
            >
              {item.text}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}
