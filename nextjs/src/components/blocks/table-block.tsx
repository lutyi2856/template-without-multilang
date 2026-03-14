import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { TableBlockAttrs } from "./types";

export function TableBlock({
  title,
  description,
  tableHtml,
  marginBottom = 40,
}: TableBlockAttrs) {
  const hasContent = title || description || tableHtml;
  if (!hasContent) return null;

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
      {tableHtml && (
        <div
          className="overflow-x-auto rounded-[25px] [&_table]:w-full [&_table]:border-collapse [&_th]:p-3 [&_th]:px-4 [&_th]:border [&_th]:border-unident-borderGray [&_th]:bg-unident-bgElements [&_th]:font-semibold [&_td]:p-3 [&_td]:px-4 [&_td]:border [&_td]:border-unident-borderGray [&_td]:text-unident-dark"
          dangerouslySetInnerHTML={{ __html: tableHtml }}
        />
      )}
    </section>
  );
}
