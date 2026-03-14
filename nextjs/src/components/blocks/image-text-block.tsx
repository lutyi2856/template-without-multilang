import Image from "next/image";
import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { ImageTextBlockAttrs } from "./types";

export function ImageTextBlock({
  title,
  image,
  description,
  layout = "left",
  descriptionPosition = "under_image",
  marginBottom = 40,
}: ImageTextBlockAttrs) {
  const hasContent = title || image?.url || description;
  if (!hasContent) return null;

  const isLeft = layout === "left";

  return (
    <section
      className={cn(
        "flex flex-col gap-5",
        "unident-image-text",
        isLeft ? "unident-layout-left" : "unident-layout-right"
      )}
      style={{ marginBottom: `${marginBottom}px` }}
    >
      {title && (
        <Heading level={2} className={cn(typography.figma["block-content-title"])}>
          {title}
        </Heading>
      )}
      {descriptionPosition === "under_title" && description && (
        <Text
          variant="block-content-body"
          className="text-unident-dark whitespace-pre-line mb-5"
        >
          {description}
        </Text>
      )}

      <div
        className={cn(
          "flex flex-wrap gap-5 items-start",
          !isLeft && "flex-row-reverse"
        )}
      >
        {image?.url && (
          <div className="flex-[0_1_auto] max-w-full min-w-0">
            <Image
              src={image.url}
              alt={image.alt || ""}
              width={image.width || 800}
              height={image.height || 450}
              className="w-full h-auto block rounded-[25px]"
              loading="lazy"
            />
          </div>
        )}
        {descriptionPosition === "under_image" && description && (
          <div className="flex-1 min-w-0">
            <Text
              variant="block-content-body"
              className="text-unident-dark whitespace-pre-line"
            >
              {description}
            </Text>
          </div>
        )}
      </div>
    </section>
  );
}
