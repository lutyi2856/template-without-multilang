---
name: multi-card-slider-pattern
description: Implement Embla Carousel slider showing multiple cards per slide (e.g., 2 cards per slide). Use when implementing sliders with grouped cards, converting single-card to multi-card sliders, or following Figma designs showing multiple items per slide.
---

# Multi-Card Slider Pattern (Embla Carousel)

## When to Use

**Use this skill when:**

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
- Need to show 2+ cards per slide in Embla Carousel
- Converting single-card slider to multi-card layout
- Implementing Figma design showing multiple cards side-by-side
- Need responsive slider (1 card mobile, 2+ desktop)
- Grouping items for slider navigation

**Example scenarios:**

- "Our Works" slider shows 2 case cards per slide
- Product grid shows 3 items per slide
- Gallery shows 4 images per slide
- Testimonials show 2 reviews per slide

---

## Quick Reference

### Basic Multi-Card Slider (2 cards per slide)

```typescript
// Client Component
"use client";
import useEmblaCarousel from "embla-carousel-react";

export function SliderClient({ items }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1, // Scroll 1 slide at a time
  });

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-6">
        {/* Group items by 2 per slide */}
        {Array.from(
          { length: Math.ceil(items.length / 2) },
          (_, slideIndex) => {
            const startIdx = slideIndex * 2;
            const slideItems = items.slice(startIdx, startIdx + 2);

            return (
              <div
                key={`slide-${slideIndex}`}
                className="flex-[0_0_100%] min-w-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {slideItems.map((item) => (
                    <Card key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
```

---

## Detailed Instructions

### Step 1: Understand the Pattern

**Key concepts:**

1. **Slide = Container** - Each slide is a container holding N cards
2. **Grouping logic** - Use `Math.ceil(total / cardsPerSlide)` to calculate slides
3. **Grid layout** - Use CSS Grid inside each slide for card layout
4. **Full-width slides** - Each slide takes `flex-[0_0_100%]` (100% of viewport)
5. **Scroll by slide** - Configure `slidesToScroll: 1` to scroll one container at a time

**Visual structure:**

```
Slider Container
├── Slide 1 (100% width)
│   ├── Card 1
│   └── Card 2
├── Slide 2 (100% width)
│   ├── Card 3
│   └── Card 4
└── Slide 3 (100% width)
    └── Card 5
```

### Step 2: Calculate Slides Count

**Formula:**

```typescript
const cardsPerSlide = 2; // or 3, 4, etc.
const slidesCount = Math.ceil(items.length / cardsPerSlide);

// Examples:
// 5 items / 2 cards = 3 slides (2, 2, 1)
// 7 items / 3 cards = 3 slides (3, 3, 1)
// 10 items / 4 cards = 3 slides (4, 4, 2)
```

**Use `Array.from()` to generate slides:**

```typescript
Array.from({ length: Math.ceil(items.length / 2) }, (_, slideIndex) => {
  // slideIndex: 0, 1, 2, ...
  const startIdx = slideIndex * 2; // 0, 2, 4, ...
  const slideItems = items.slice(startIdx, startIdx + 2); // [item0, item1], [item2, item3], ...

  return <Slide key={slideIndex} items={slideItems} />;
});
```

### Step 3: Implement Slide Container

**Full-width slide with flex-basis 100%:**

```typescript
<div key={`slide-${slideIndex}`} className="flex-[0_0_100%] min-w-0">
  {/* Grid layout for cards inside */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {slideItems.map((item) => (
      <Card key={item.id} item={item} />
    ))}
  </div>
</div>
```

**Responsive grid:**

- `grid-cols-1` - 1 card on mobile
- `md:grid-cols-2` - 2 cards on desktop
- `gap-6` - spacing between cards

**For 3 cards per slide:**

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {slideItems.map((item) => (
    <Card key={item.id} item={item} />
  ))}
</div>
```

### Step 4: Configure Embla Options

**Options for multi-card slider:**

```typescript
const [emblaRef, emblaApi] = useEmblaCarousel({
  align: "start", // Align slides to start
  loop: true, // Enable infinite loop
  slidesToScroll: 1, // Scroll 1 slide at a time
  skipSnaps: false, // Don't skip slides
  containScroll: "trimSnaps", // Trim empty space at end (optional)
});
```

**With autoplay:**

```typescript
import Autoplay from "embla-carousel-autoplay";

const [emblaRef, emblaApi] = useEmblaCarousel(
  {
    align: "start",
    loop: true,
    slidesToScroll: 1,
  },
  [
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    }),
  ]
);
```

### Step 5: Add Navigation & Dots

**Dots navigation (correct count):**

```typescript
const [selectedIndex, setSelectedIndex] = React.useState(0);
const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

React.useEffect(() => {
  if (!emblaApi) return;
  setScrollSnaps(emblaApi.scrollSnapList()); // Will be [0, 1, 2] for 3 slides
  emblaApi.on("select", () => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  });
}, [emblaApi]);

// Render dots
{
  scrollSnaps.map((_, index) => (
    <button
      key={index}
      onClick={() => emblaApi?.scrollTo(index)}
      className={index === selectedIndex ? "active" : ""}
    >
      Go to slide {index + 1}
    </button>
  ));
}
```

**Arrow navigation:**

```typescript
const scrollPrev = () => emblaApi?.scrollPrev();
const scrollNext = () => emblaApi?.scrollNext();

<button onClick={scrollPrev} disabled={!canScrollPrev}>
  Previous
</button>
<button onClick={scrollNext} disabled={!canScrollNext}>
  Next
</button>
```

---

## Complete Example: Our Works Slider (2 cards per slide)

```typescript
"use client";
import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { CaseCard } from "@/components/figma/case";
import { SliderNavigation } from "@/components/figma/review-card/slider-navigation";

interface OurWorksSectionClientProps {
  works: OurWork[];
}

export function OurWorksSectionClient({ works }: OurWorksSectionClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 5000 })]
  );

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
      {/* Header with navigation */}
      <div className="flex justify-between mb-12">
        <h2>Our Works</h2>
        <SliderNavigation
          onPrev={scrollPrev}
          onNext={scrollNext}
          canScrollPrev={canScrollPrev}
          canScrollNext={canScrollNext}
        />
      </div>

      {/* Slider with 2 cards per slide */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {Array.from(
            { length: Math.ceil(works.length / 2) },
            (_, slideIndex) => {
              const startIdx = slideIndex * 2;
              const slideWorks = works.slice(startIdx, startIdx + 2);

              return (
                <div
                  key={`slide-${slideIndex}`}
                  className="flex-[0_0_100%] min-w-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {slideWorks.map((work) => (
                      <CaseCard key={work.id} work={work} />
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Dots pagination */}
      {scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? "bg-unident-primary w-6"
                  : "bg-unident-borderGray"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Variations

### 3 Cards Per Slide

```typescript
{
  Array.from({ length: Math.ceil(items.length / 3) }, (_, slideIndex) => {
    const startIdx = slideIndex * 3;
    const slideItems = items.slice(startIdx, startIdx + 3);

    return (
      <div key={`slide-${slideIndex}`} className="flex-[0_0_100%] min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slideItems.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </div>
    );
  });
}
```

### 4 Cards Per Slide

```typescript
<div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
  {slideItems.map((item) => (
    <Card key={item.id} item={item} />
  ))}
</div>
```

### Variable Cards (Responsive)

```typescript
// Show 1 card on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {slideItems.map((item) => (
    <Card key={item.id} item={item} />
  ))}
</div>
```

---

## Common Errors

### Error: Slider shows 5 dots instead of 3 (for 5 items / 2 per slide)

**Cause:** Old code cached, slider not grouped

**Fix:**

1. Verify code uses `Array.from({ length: Math.ceil(items.length / 2) })`
2. Clear `.next` folder: `rm -rf nextjs/.next`
3. Restart Next.js dev server
4. Check logs: `[Component] slidesCount: 3` should match expected

### Error: Cards overlap or wrong width

**Cause:** Missing `min-w-0` or incorrect flex-basis

**Fix:**

```typescript
// ✅ Correct
<div className="flex-[0_0_100%] min-w-0">

// ❌ Wrong
<div className="flex-1"> // Incorrect width
<div className="w-full"> // Can cause overflow
```

### Error: Last slide shows empty space

**Cause:** Last slide has fewer cards than cardsPerSlide

**Fix:** This is normal behavior. Last slide will have remaining cards:

- 5 items / 2 per slide = [2, 2, 1] ✅ Expected
- Use `containScroll: 'trimSnaps'` if needed

### Error: Navigation dots not updating

**Cause:** Not listening to Embla `select` event

**Fix:**

```typescript
React.useEffect(() => {
  if (!emblaApi) return;
  emblaApi.on("select", () => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  });
}, [emblaApi]);
```

---

## Best Practices

### ✅ DO:

1. **Calculate slides count correctly** - `Math.ceil(items.length / cardsPerSlide)`
2. **Use flex-basis 100%** - `flex-[0_0_100%]` for full-width slides
3. **Add min-w-0** - Prevents overflow issues
4. **Use CSS Grid inside slide** - `grid-cols-1 md:grid-cols-2`
5. **Handle odd numbers** - Last slide may have fewer cards (OK)
6. **Add console.log for debugging** - Log `slidesCount` and `cardsPerSlide`
7. **Test with different totals** - 3, 5, 7 items etc.

### ❌ DON'T:

1. ❌ Use `flex-1` for slides (causes wrong width)
2. ❌ Forget `min-w-0` (causes overflow)
3. ❌ Map items directly without grouping (creates N slides instead of N/cardsPerSlide)
4. ❌ Use `w-full` instead of `flex-[0_0_100%]`
5. ❌ Forget responsive grid (`grid-cols-1 md:grid-cols-2`)

---

## Pattern Comparison

### Single Card Per Slide (OLD)

```typescript
// ❌ Shows 1 card per slide = 5 slides for 5 items
<div className="flex gap-6">
  {items.map((item) => (
    <div key={item.id} className="flex-[0_0_100%] min-w-0">
      <Card item={item} />
    </div>
  ))}
</div>
```

### Multiple Cards Per Slide (NEW)

```typescript
// ✅ Shows 2 cards per slide = 3 slides for 5 items
<div className="flex gap-6">
  {Array.from({ length: Math.ceil(items.length / 2) }, (_, slideIndex) => {
    const slideItems = items.slice(slideIndex * 2, slideIndex * 2 + 2);
    return (
      <div key={`slide-${slideIndex}`} className="flex-[0_0_100%] min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slideItems.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      </div>
    );
  })}
</div>
```

---

## Integration with SliderNavigation

**Add customizable background prop:**

```typescript
// slider-navigation.tsx
interface SliderNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  background?: "white" | "transparent" | "default"; // NEW
}

export function SliderNavigation({ background = "default", ...props }) {
  let backgroundStyle: string;
  if (background === "white") {
    backgroundStyle = "bg-white border border-unident-borderGray";
  } else if (background === "transparent") {
    backgroundStyle = "bg-transparent border border-unident-borderGray";
  } else {
    // default - preserve existing behavior
    backgroundStyle =
      size === "large"
        ? "bg-transparent border border-unident-borderGray"
        : "bg-unident-bgTopbar";
  }

  return (
    <div className="flex gap-2">
      <button className={`${backgroundStyle} ...`}>Prev</button>
      <button className={`${backgroundStyle} ...`}>Next</button>
    </div>
  );
}
```

**Usage:**

```typescript
// Our Works - white background
<SliderNavigation {...props} background="white" />

// Reviews - default (transparent, no breaking change)
<SliderNavigation {...props} />
```

---

## Testing Checklist

**After implementation:**

- [ ] Correct number of slides: `Math.ceil(items.length / cardsPerSlide)`
- [ ] Navigation works (prev/next buttons)
- [ ] Dots show correct count (matches slides, not items)
- [ ] Responsive: 1 card mobile, 2+ desktop
- [ ] Last slide handles odd numbers gracefully
- [ ] Loop works correctly
- [ ] Autoplay works (if enabled)
- [ ] No console errors
- [ ] Check logs: `slidesCount` matches expected

**Test with different counts:**

```typescript
console.log("[Slider] Config:", {
  totalItems: items.length,
  cardsPerSlide: 2,
  slidesCount: Math.ceil(items.length / 2),
  // 5 items → 3 slides
  // 6 items → 3 slides
  // 7 items → 4 slides
});
```

---

## Performance Notes

**Bundle size:**

- Embla Carousel core: ~4KB gzipped
- Autoplay plugin: ~1KB gzipped
- Total: ~5KB

**Optimization:**

```typescript
// ✅ Use Client Component only for slider logic
// Server Component
export async function WorksSection() {
  const works = await getWorks(); // Server-side fetch
  return <WorksSectionClient works={works} />; // Pass to client
}

// Client Component (minimal)
'use client'
export function WorksSectionClient({ works }) {
  // Only slider logic, no data fetching
  const [emblaRef] = useEmblaCarousel({ ... });
  return <div ref={emblaRef}>{/* slides */}</div>;
}
```

---

**Status:** ✅ Production-ready pattern
**Priority:** 🟡 MEDIUM - Common UI pattern
**Version:** 1.0.0
