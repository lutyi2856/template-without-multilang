import Image from "next/image";
import { Heading, Text } from "@/components/design-system";
import { typography } from "@/design-tokens/typography";
import { cn } from "@/lib/utils";
import type { VideoBlockAttrs } from "./types";

export function VideoBlock({
  title,
  text,
  textPosition = "under_title",
  items,
  marginBottom = 40,
}: VideoBlockAttrs) {
  const hasContent = title || text || (items && items.length > 0);
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
      {textPosition === "under_title" && text && (
        <Text
          variant="block-content-body"
          className="text-unident-dark whitespace-pre-line"
        >
          {text}
        </Text>
      )}

      {items && items.length > 0 && (
        <div className="flex flex-col gap-5">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col gap-2.5">
              {item.mediaType === "video" && item.videoUrl && (
                <div className="rounded-[25px] overflow-hidden">
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full h-auto block"
                  >
                    <source
                      src={item.videoUrl}
                      type={item.videoMime || "video/mp4"}
                    />
                  </video>
                </div>
              )}
              {item.mediaType === "image" && item.image?.url && (
                <div className="rounded-[25px] overflow-hidden relative">
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || ""}
                    width={item.image.width || 800}
                    height={item.image.height || 450}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              {item.headline && (
                <Heading level={3} className={cn(typography.figma["block-content-title"])}>
                  {item.headline}
                </Heading>
              )}
              {item.description && (
                <Text
                  variant="block-content-body"
                  className="text-unident-dark whitespace-pre-line"
                >
                  {item.description}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}

      {textPosition === "under_video" && text && (
        <Text
          variant="block-content-body"
          className="text-unident-dark whitespace-pre-line"
        >
          {text}
        </Text>
      )}
    </section>
  );
}
