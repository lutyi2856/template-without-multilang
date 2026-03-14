import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { TitleTextBlockAttrs } from "./types";

const TAG_TO_LEVEL: Record<string, 1 | 2 | 3 | 4 | 5 | 6> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
};

export function TitleTextBlock({
  title,
  tag = "h2",
  description,
  marginBottom = 40,
}: TitleTextBlockAttrs) {
  const level = TAG_TO_LEVEL[tag] ?? 2;
  const isHeading = tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4";

  return (
    <section
      className="flex flex-col gap-5"
      style={{ marginBottom: `${marginBottom}px` }}
    >
      {title &&
        (isHeading ? (
          <Heading level={level} className={cn(typography.figma["block-content-title"])}>
            {title}
          </Heading>
        ) : (
          <Text variant="block-content-body" as={tag === "div" ? "div" : "p"} className="text-unident-dark">
            {title}
          </Text>
        ))}
      {description && (
        <Text
          variant="block-content-body"
          className="text-unident-dark whitespace-pre-line"
        >
          {description}
        </Text>
      )}
    </section>
  );
}
