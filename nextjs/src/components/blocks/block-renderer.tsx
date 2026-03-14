import type { ComponentType } from "react";
import type { ContentBlock } from "./types";
import { TextBlock } from "./text-block";
import { TOCBlock } from "./toc-block";
import { UniversalBlock } from "./universal-block";
import { ImportantBlock } from "./important-block";
import { ListBlock } from "./list-block";
import { ExpertOpinionBlock } from "./expert-opinion-block";
import { TitleTextBlock } from "./title-text-block";
import { NumberedListBlock } from "./numbered-list-block";
import { ReadingsBlock } from "./readings-block";
import { VideoBlock } from "./video-block";
import { QuoteBlock } from "./quote-block";
import { TableBlock } from "./table-block";
import { ImageTextBlock } from "./image-text-block";
import { AdvantagesBlock } from "./advantages-block";
import { FaqBlock } from "./faq-block";
import { CtaBlock } from "./cta-block";
import { CtaFormBlock } from "./cta-form-block";
import { StaLogoBlock } from "./sta-logo-block";
import { SliderImageBlock } from "./slider-image-block";
import { LicencesBlock } from "./licences-block";
import { PromotionBlock } from "./promotion-block";
import { ServicePricesBlock } from "./service-prices-block";
import { AnchorNavBlock } from "./anchor-nav-block";
import { ExpertKbBlock } from "./expert-kb-block";

/* eslint-disable @typescript-eslint/no-explicit-any */
const BLOCK_MAP: Record<string, ComponentType<any>> = {
  "acf/unident-text": TextBlock,
  "acf/unident-toc": TOCBlock,
  "acf/unident-universal": UniversalBlock,
  "acf/unident-important": ImportantBlock,
  "acf/unident-list": ListBlock,
  "acf/unident-expert-opinion": ExpertOpinionBlock,
  "acf/unident-title-text": TitleTextBlock,
  "acf/unident-numbered-list": NumberedListBlock,
  "acf/unident-readings": ReadingsBlock,
  "acf/unident-video": VideoBlock,
  "acf/unident-quote": QuoteBlock,
  "acf/unident-table": TableBlock,
  "acf/unident-image-text": ImageTextBlock,
  "acf/unident-advantages": AdvantagesBlock,
  "acf/unident-faq": FaqBlock,
  "acf/unident-cta": CtaBlock,
  "acf/unident-cta-form": CtaFormBlock,
  "acf/unident-sta-logo": StaLogoBlock,
  "acf/unident-slider-image": SliderImageBlock,
  "acf/unident-licences": LicencesBlock,
  "acf/unident-promotion": PromotionBlock,
  "acf/unident-service-prices": ServicePricesBlock,
  "acf/unident-anchor-nav": AnchorNavBlock,
  "acf/unident-expert-kb": ExpertKbBlock,
};

interface BlockRendererProps {
  blocks: ContentBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-0">
      {blocks.map((block, index) => {
        const Component = BLOCK_MAP[block.name];
        if (!Component) return null;

        let attrs: Record<string, unknown>;
        try {
          attrs = JSON.parse(block.attributes);
        } catch {
          return null;
        }

        return <Component key={`${block.name}-${index}`} {...attrs} />;
      })}
    </div>
  );
}
