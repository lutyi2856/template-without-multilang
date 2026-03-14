import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { AdvantagesBlockAttrs } from "./types";

export function AdvantagesBlock({
  title,
  description,
  items,
  marginBottom = 40,
}: AdvantagesBlockAttrs) {
  const hasContent = title || description || (items && items.length > 0);
  if (!hasContent) return null;

  return (
    <section style={{ marginBottom: `${marginBottom}px` }}>
      <div className="bg-unident-bgElements rounded-[25px] p-8 md:p-10 flex flex-col gap-5">
        {title && (
          <Heading level={2} className={cn(typography.figma["block-content-title"])}>
            {title}
          </Heading>
        )}
        {description && (
          <div
            className={cn(typography.figma["block-content-body"], "text-unident-dark prose prose-p:mb-0 max-w-none")}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {items && items.length > 0 && (
          <div className="flex flex-col gap-5">
            {items.map((item, i) => (
              <div key={i} className="flex gap-5 items-start">
                {item.num && (
                  <span
                    className={cn(
                      "flex items-center justify-center shrink-0 w-14 h-14 min-w-[55px] min-h-[55px] rounded-full bg-white text-unident-primary font-medium",
                      typography.figma["block-content-body"]
                    )}
                  >
                    {item.num}
                  </span>
                )}
                <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                  {item.title && (
                    <Heading level={3} className={cn(typography.figma["block-content-title"])}>
                      {item.title}
                    </Heading>
                  )}
                  {item.text && (
                    <div
                      className={cn(typography.figma["block-content-body"], "text-unident-dark prose prose-p:mb-0 max-w-none")}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
