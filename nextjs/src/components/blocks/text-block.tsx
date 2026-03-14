import { Heading } from "@/components/design-system";
import type { TextBlockAttrs } from "./types";

const TAG_TO_LEVEL: Record<string, 1 | 2 | 3 | 4 | 5 | 6> = {
  h2: 2,
  h3: 3,
  h4: 4,
};

export function TextBlock({ heading, headingTag, content, anchorId, marginBottom = 40 }: TextBlockAttrs) {
  const level = TAG_TO_LEVEL[headingTag] ?? 2;

  return (
    <section
      className="scroll-mt-24"
      style={{ marginBottom: `${marginBottom}px` }}
      {...(anchorId && { id: anchorId })}
    >
      {heading && (
        <Heading level={level} className="mb-4">
          {heading}
        </Heading>
      )}
      {content && (
        <div
          className="font-gilroy text-[16px] leading-[1.6] text-unident-dark prose prose-ul:pl-5 prose-li:marker:text-unident-primary max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </section>
  );
}
