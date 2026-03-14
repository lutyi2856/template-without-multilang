import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { QuoteBlockAttrs } from "./types";

export function QuoteBlock({ title, text, marginBottom = 40 }: QuoteBlockAttrs) {
  if (!title && !text) return null;

  return (
    <section style={{ marginBottom: `${marginBottom}px` }}>
      <blockquote className="border-none p-0 m-0">
        {title && (
          <Heading level={2} className={cn(typography.figma["block-content-title"], "mb-5")}>
            {title}
          </Heading>
        )}
        {text && (
          <Text variant="block-content-body" className="text-unident-dark">
            {text}
          </Text>
        )}
      </blockquote>
    </section>
  );
}
