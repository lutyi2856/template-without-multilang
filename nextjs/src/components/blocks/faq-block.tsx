"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Heading } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { FaqBlockAttrs } from "./types";

export function FaqBlock({ title, items, marginBottom = 40 }: FaqBlockAttrs) {
  const hasContent = title || (items && items.length > 0);
  if (!hasContent) return null;

  return (
    <section style={{ marginBottom: `${marginBottom}px` }}>
      {title && (
        <Heading level={2} className={cn(typography.figma["block-content-title"], "mb-5")}>
          {title}
        </Heading>
      )}
      {items && items.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-unident-borderGray">
              <AccordionTrigger className={cn(typography.figma["block-content-body"], "text-unident-dark hover:no-underline py-4")}>
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className={cn(typography.figma["block-content-body"], "text-unident-dark prose prose-p:mb-2 max-w-none")}
                  dangerouslySetInnerHTML={{ __html: item.answer ?? '' }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </section>
  );
}
