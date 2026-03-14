import Image from "next/image";
import { Heading, Text } from "@/components/design-system";
import { CallbackForm } from "@/components/forms/callback-form";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { CtaFormBlockAttrs } from "./types";

export function CtaFormBlock({
  title,
  description,
  bgImage,
  marginBottom = 40,
}: CtaFormBlockAttrs) {
  const hasContent = title || description;
  if (!hasContent) return null;

  return (
    <section style={{ marginBottom: `${marginBottom}px` }}>
      <div
        className={cn(
          "rounded-[25px] p-8 md:p-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8",
          bgImage?.url ? "bg-cover bg-center" : "bg-unident-bgElements"
        )}
        style={bgImage?.url ? { backgroundImage: `url(${bgImage.url})` } : undefined}
      >
        <div className={cn("flex-1 min-w-0", bgImage?.url && "bg-white/90 rounded-[15px] p-6")}>
          {title && (
            <Heading level={2} className={cn(typography.figma["block-content-title"], "mb-4")}>
              {title}
            </Heading>
          )}
          {description && (
            <Text variant="block-content-body" className="text-unident-dark mb-6">
              {description}
            </Text>
          )}
        </div>
        <div className="shrink-0 w-full md:w-auto md:min-w-[320px]">
          <CallbackForm variant="cta" />
        </div>
      </div>
    </section>
  );
}
