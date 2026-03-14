import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { ReadingsBlockAttrs } from "./types";

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
    className="shrink-0 mt-1.5"
  >
    <rect width="10" height="10" rx="5" fill="#526AC2" />
  </svg>
);

export function ReadingsBlock({
  title,
  description,
  icon = "dot",
  items,
  marginBottom = 40,
}: ReadingsBlockAttrs) {
  const hasContent = title || description || (items && items.length > 0);
  if (!hasContent) return null;

  const MarkerIcon = icon === "checkmark" ? CHECKMARK_SVG : DOT_SVG;

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
      {description && (
        <Text
          variant="block-content-body"
          className="text-unident-dark whitespace-pre-line"
        >
          {description}
        </Text>
      )}
      {items && items.length > 0 && (
        <ul className="list-none p-0 m-0 flex flex-col gap-5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <span
                className={cn(
                  "flex items-center justify-center mt-0.5 shrink-0",
                  icon === "checkmark" ? "w-[25px] h-[25px]" : "w-[10px] h-[10px]"
                )}
              >
                {MarkerIcon}
              </span>
              <Text
                variant="block-list-item"
                className="text-unident-dark"
              >
                {item.itemText}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
