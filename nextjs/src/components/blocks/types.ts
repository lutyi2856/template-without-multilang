/**
 * TypeScript types for Gutenberg ACF blocks.
 *
 * These types mirror the JSON structure returned by the
 * `contentBlocks` GraphQL field (register-content-blocks-graphql.php).
 */

/* ─── GraphQL envelope ───────────────────────────────────── */

export interface ContentBlock {
  name: string;
  attributes: string; // JSON — parsed per block type
}

/* ─── Shared ─────────────────────────────────────────────── */

export interface ResolvedImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/* ─── 1. Text Block ──────────────────────────────────────── */

export interface TextBlockAttrs {
  heading: string;
  anchorId?: string;
  headingTag: "h2" | "h3" | "h4";
  content: string;
  marginBottom?: number;
}

/* ─── 2. Table of Contents ───────────────────────────────── */

export interface TOCItem {
  anchorId: string;
  label: string;
}

export interface TOCBlockAttrs {
  heading: string;
  items: TOCItem[];
  marginBottom?: number;
}

/* ─── 3. Universal Block ─────────────────────────────────── */

export type UniversalComponentType =
  | "text_regular"
  | "text_highlight"
  | "bullet_list"
  | "image";

export interface UniversalComponent {
  type: UniversalComponentType;
  sortOrder: number;
  textContent?: string;
  listItems?: string[];
  icon?: "dot" | "checkmark";
  image?: ResolvedImage | null;
}

export interface UniversalBlockAttrs {
  heading: string;
  anchorId?: string;
  components: UniversalComponent[];
  marginBottom?: number;
}

/* ─── 4. Important Block ─────────────────────────────────── */

export interface ImportantBlockAttrs {
  heading: string;
  anchorId?: string;
  smallImage: ResolvedImage | null;
  content: string;
  marginBottom?: number;
}

/* ─── 5. List Block ──────────────────────────────────────── */

export interface ListItemService {
  title: string;
  slug: string;
}

export interface ListItem {
  number: string;
  itemHeading: string;
  itemDescription: string;
  serviceLink: ListItemService | null;
}

export interface ListBlockAttrs {
  heading: string;
  anchorId?: string;
  description: string;
  listType: "numbered" | "bulleted";
  marker?: "dot" | "checkmark";
  items: ListItem[];
  marginBottom?: number;
}

/* ─── 6. Expert Opinion Block ────────────────────────────── */

export interface ExpertDoctor {
  name: string;
  slug: string;
  specialty: string;
  experience: string;
  imageUrl: string;
}

export interface ExpertOpinionBlockAttrs {
  heading: string;
  anchorId?: string;
  quote: string;
  doctor: ExpertDoctor | null;
  customImage: ResolvedImage | null;
  marginBottom?: number;
}

/* ─── Phase 1: KB blocks ──────────────────────────────────── */

export interface TitleTextBlockAttrs {
  title?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  description?: string;
  marginBottom?: number;
}

export interface NumberedListItem {
  number?: string;
  text?: string;
}

export interface NumberedListBlockAttrs {
  title?: string;
  h3?: string;
  h4?: string;
  description?: string;
  listType?: "numbered" | "bulleted";
  marker?: "checkmark" | "dot";
  items?: NumberedListItem[];
  marginBottom?: number;
}

export interface ReadingsBlockAttrs {
  title?: string;
  description?: string;
  icon?: "dot" | "checkmark";
  items?: { itemText: string }[];
  marginBottom?: number;
}

export interface VideoBlockItem {
  mediaType: "video" | "image";
  videoUrl?: string;
  videoMime?: string;
  image?: ResolvedImage | null;
  headline?: string;
  description?: string;
  width?: string;
}

export interface VideoBlockAttrs {
  title?: string;
  text?: string;
  textPosition?: "under_title" | "under_video";
  items?: VideoBlockItem[];
  marginBottom?: number;
}

export interface QuoteBlockAttrs {
  title?: string;
  text?: string;
  marginBottom?: number;
}

export interface TableBlockAttrs {
  title?: string;
  description?: string;
  tableHtml?: string;
  marginBottom?: number;
}

/* ─── Phase 2: image-text, advantages ────────────────────── */

export interface ImageTextBlockAttrs {
  title?: string;
  image?: ResolvedImage | null;
  description?: string;
  layout?: "left" | "right";
  descriptionPosition?: "under_title" | "under_image";
  marginBottom?: number;
}

export interface AdvantagesItem {
  num?: string;
  title?: string;
  text?: string;
}

export interface AdvantagesBlockAttrs {
  title?: string;
  description?: string;
  items?: AdvantagesItem[];
  marginBottom?: number;
}

/* ─── Phase 3: faq, cta, cta-form, sta-logo ────────────────── */

export interface FaqItem {
  question?: string;
  answer?: string;
}

export interface FaqBlockAttrs {
  title?: string;
  items?: FaqItem[];
  marginBottom?: number;
}

export interface CtaBlockAttrs {
  title?: string;
  description?: string;
  urlPaid?: string;
  urlOms?: string;
  showPaid?: boolean;
  showOms?: boolean;
  showCallback?: boolean;
  marginBottom?: number;
}

export interface CtaFormBlockAttrs {
  title?: string;
  description?: string;
  bgImage?: ResolvedImage | null;
  marginBottom?: number;
}

export interface LicencesBlockItem {
  itemTitle?: string;
  itemDescription?: string;
  image?: ResolvedImage | null;
}

export interface PromotionBlockSlide {
  link?: string;
  imageDesktop?: ResolvedImage | null;
  imageMobile?: ResolvedImage | null;
}

export interface PromotionBlockAttrs {
  slides?: PromotionBlockSlide[];
  marginBottom?: number;
}

/* ─── Phase 5: service-prices, anchor-nav, expert-kb ─────────────────────── */

export interface ServicePricesBlockPrice {
  uid?: string;
  name?: string;
  price?: string;
  currency?: string;
}

export interface ServicePricesBlockAttrs {
  sectionTitle?: string;
  headline?: string;
  prices?: ServicePricesBlockPrice[];
  focusPrice?: ServicePricesBlockPrice | null;
  urlPaid?: string;
  urlOms?: string;
  showPaid?: boolean;
  showOms?: boolean;
  marginBottom?: number;
}

export interface AnchorNavBlockItem {
  text?: string;
  anchor?: string;
}

export interface AnchorNavBlockAttrs {
  items?: AnchorNavBlockItem[];
  marginBottom?: number;
}

export interface ExpertKbBlockDoctor {
  name?: string;
  slug?: string;
  specialty?: string;
  experience?: string;
  imageUrl?: string;
  url?: string;
}

export interface ExpertKbBlockAttrs {
  quote?: string;
  dataSource?: "connection" | "manual";
  doctor?: ExpertKbBlockDoctor | null;
  manualName?: string;
  manualUrl?: string;
  manualSpecialties?: string;
  manualExperience?: string;
  manualImage?: ResolvedImage | null;
  customImage?: ResolvedImage | null;
  displayImage?: ResolvedImage | null;
  showPhoto?: boolean;
  showName?: boolean;
  showSpecialties?: boolean;
  showExperience?: boolean;
  urlPaid?: string;
  urlOms?: string;
  showPaid?: boolean;
  showOms?: boolean;
  marginBottom?: number;
}

export interface LicencesBlockAttrs {
  title?: string;
  items?: LicencesBlockItem[];
  marginBottom?: number;
}

export interface SliderImageBlockAttrs {
  title?: string;
  text?: string;
  images?: ResolvedImage[];
  marginBottom?: number;
}

export interface StaLogoBlockAttrs {
  title?: string;
  description?: string;
  logotype?: ResolvedImage | null;
  urlPaid?: string;
  urlOms?: string;
  showPaid?: boolean;
  showOms?: boolean;
  showCallback?: boolean;
  marginBottom?: number;
}

/* ─── Block name → attrs map (for type narrowing) ────────── */

export interface BlockAttrsMap {
  "acf/unident-text": TextBlockAttrs;
  "acf/unident-toc": TOCBlockAttrs;
  "acf/unident-universal": UniversalBlockAttrs;
  "acf/unident-important": ImportantBlockAttrs;
  "acf/unident-list": ListBlockAttrs;
  "acf/unident-expert-opinion": ExpertOpinionBlockAttrs;
  "acf/unident-title-text": TitleTextBlockAttrs;
  "acf/unident-numbered-list": NumberedListBlockAttrs;
  "acf/unident-readings": ReadingsBlockAttrs;
  "acf/unident-video": VideoBlockAttrs;
  "acf/unident-quote": QuoteBlockAttrs;
  "acf/unident-table": TableBlockAttrs;
  "acf/unident-image-text": ImageTextBlockAttrs;
  "acf/unident-advantages": AdvantagesBlockAttrs;
  "acf/unident-faq": FaqBlockAttrs;
  "acf/unident-cta": CtaBlockAttrs;
  "acf/unident-cta-form": CtaFormBlockAttrs;
  "acf/unident-sta-logo": StaLogoBlockAttrs;
  "acf/unident-slider-image": SliderImageBlockAttrs;
  "acf/unident-licences": LicencesBlockAttrs;
  "acf/unident-promotion": PromotionBlockAttrs;
  "acf/unident-service-prices": ServicePricesBlockAttrs;
  "acf/unident-anchor-nav": AnchorNavBlockAttrs;
  "acf/unident-expert-kb": ExpertKbBlockAttrs;
}

export type BlockName = keyof BlockAttrsMap;
