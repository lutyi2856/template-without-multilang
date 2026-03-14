---
name: inline-svg-vs-images
description: When to use inline SVG vs next/image for icons and graphics. Performance-first approach for zero HTTP requests. Use when implementing icons, logos, or deciding between SVG rendering methods.
---

# Inline SVG vs next/image: Performance-First Decision

## The Rule

**For icons and small graphics: ALWAYS use inline SVG (zero HTTP requests)**
**For photos and large images: Use next/image (optimization benefits)**

## Why Inline SVG for Icons?

### Performance Benefits

✅ **Zero HTTP requests** - SVG embedded in HTML
✅ **Instant rendering** - No loading delay
✅ **Smaller total size** - No overhead of separate file request
✅ **No FOUC** - Icons appear immediately with page
✅ **Easy styling** - Can change colors with CSS/props

### When to Use Inline SVG

- ❤️ **Social media icons** (< 2KB each)
- ❤️ **UI icons** (arrows, checkmarks, etc.)
- ❤️ **Logos** (company logo, brand marks)
- ❤️ **Decorative graphics** (< 5KB)
- ❤️ **Icons with gradients/effects** (can't change via CSS filter)

## Implementation: Inline SVG

### Method 1: Direct Component

```typescript
// components/icons/telegram-icon.tsx
export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M16.4809 3.69158C..." 
        fill="url(#gradient-telegram)"
      />
      <defs>
        <linearGradient id="gradient-telegram">
          <stop stopColor="#2E365D"/>
          <stop offset="1" stopColor="#46559D"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
```

### Method 2: dangerouslySetInnerHTML (from CMS)

```typescript
// When SVG comes from WordPress ACF
interface SocialLink {
  name: string;
  icon: string; // SVG code as string
  url: string;
}

export function SocialLinks({ links }: { links: SocialLink[] }) {
  return (
    <div className="flex gap-2">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          aria-label={link.name}
          className="inline-flex items-center justify-center w-10 h-10"
        >
          {/* ✅ Inline SVG from CMS */}
          <div dangerouslySetInnerHTML={{ __html: link.icon }} />
        </a>
      ))}
    </div>
  );
}
```

### Method 3: SVG Sprite (for repeated icons)

```xml
<!-- public/icons/sprite.svg -->
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <symbol id="icon-phone" viewBox="0 0 24 24">
    <path d="..."/>
  </symbol>
  <symbol id="icon-email" viewBox="0 0 24 24">
    <path d="..."/>
  </symbol>
</svg>
```

```typescript
// Usage
<svg className="w-6 h-6">
  <use href="/icons/sprite.svg#icon-phone" />
</svg>
```

## Why next/image for Photos?

### Optimization Benefits

✅ **Automatic WebP/AVIF** - Modern format conversion
✅ **Responsive sizes** - Multiple sizes for different screens
✅ **Lazy loading** - Load only when visible
✅ **Blur placeholder** - Better UX while loading
✅ **Prevents CLS** - Width/height prevents layout shift

### When to Use next/image

- 📸 **Photos** (portraits, landscapes)
- 📸 **Hero images** (large banners)
- 📸 **Product images** (e-commerce)
- 📸 **Content images** (blog posts, articles)
- 📸 **Backgrounds** (large decorative images)

## Implementation: next/image

**Примечание для изображений из WordPress GraphQL:** `sourceUrl` без аргумента size даёт полный URL. Не использовать `sourceUrl(size: FULL)` без проверки schema — см. [wpgraphql-media-item-sizes](../wpgraphql-media-item-sizes/SKILL.md).

```typescript
import Image from 'next/image';

// For photos
<Image
  src="/images/doctor.jpg"
  alt="Dr. Smith"
  width={400}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// For hero image (LCP)
<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // ✅ For above-the-fold images
  quality={90}
/>
```

## Comparison Table

| Aspect | Inline SVG | next/image |
|--------|-----------|------------|
| **HTTP Requests** | 0 | 1 per image |
| **File Size** | ~1-5KB | 50-500KB+ |
| **Load Time** | Instant | Network dependent |
| **Caching** | With HTML | Separate cache |
| **Format** | Vector (scalable) | Raster (pixels) |
| **Styling** | CSS/props | Limited |
| **Best For** | Icons, logos | Photos, large images |

## Real Example from Chat

### ❌ WRONG: next/image for Icons

```typescript
// ❌ BAD - Creates 5 HTTP requests for 5 icons
import Image from 'next/image';

<div className="social-icons">
  <Image src="/icons/telegram.svg" width={20} height={20} />
  <Image src="/icons/whatsapp.svg" width={20} height={20} />
  <Image src="/icons/vk.svg" width={20} height={20} />
  <Image src="/icons/instagram.svg" width={20} height={20} />
  <Image src="/icons/ok.svg" width={20} height={20} />
</div>
```

**Problems:**
- 5 HTTP requests (instead of 0)
- Loading delay
- FOUC (flash of unstyled content)
- Violates performance-first philosophy

### ✅ CORRECT: Inline SVG for Icons

```typescript
// ✅ GOOD - Zero HTTP requests
interface SocialLink {
  name: string;
  icon: string; // '<svg>...</svg>'
  url: string;
}

function SocialLinks({ links }: { links: SocialLink[] }) {
  return (
    <div className="flex gap-2">
      {links.map((link, idx) => (
        <a key={idx} href={link.url} aria-label={link.name}>
          {/* Inline SVG - zero HTTP requests */}
          <div dangerouslySetInnerHTML={{ __html: link.icon }} />
        </a>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ Zero HTTP requests
- ✅ Instant rendering
- ✅ No loading delay
- ✅ Follows performance-first philosophy

## WordPress ACF Setup for Inline SVG

### ACF Field Configuration

```php
array(
    'key' => 'field_icon',
    'label' => 'Icon (SVG code)',
    'name' => 'icon',
    'type' => 'textarea', // ✅ textarea, not image
    'instructions' => 'Paste SVG code (e.g. <svg>...</svg>)',
    'rows' => 8,
    'new_lines' => '', // ✅ Don't convert to <br>
    'show_in_graphql' => 1,
)
```

### GraphQL Returns String

```graphql
query GetIcons {
  socialLinks {
    name
    icon  # Returns "<svg>...</svg>" as string
    url
  }
}
```

## Edge Cases

### Case 1: Icon Too Complex (> 10KB)

**Solution:** Consider SVG sprite or optimizing SVG

```bash
# Optimize SVG with SVGO
npx svgo input.svg -o output.svg
```

### Case 2: Icon Changes Color on Hover

**Solution 1:** Use CSS `fill` (if single-color)

```typescript
<svg className="fill-gray-500 hover:fill-blue-500">
  <path d="..." />
</svg>
```

**Solution 2:** Use gradient in SVG (if multi-color)

```xml
<svg>
  <defs>
    <linearGradient id="icon-gradient">
      <stop stopColor="currentColor"/>
      <stop offset="1" stopColor="currentColor"/>
    </linearGradient>
  </defs>
  <path fill="url(#icon-gradient)"/>
</svg>
```

### Case 3: Many Repeated Icons

**Solution:** SVG sprite (1 HTTP request for all icons)

```xml
<!-- public/icons.svg -->
<svg style="display: none;">
  <symbol id="icon-1">...</symbol>
  <symbol id="icon-2">...</symbol>
</svg>
```

```typescript
// Usage
<svg><use href="/icons.svg#icon-1" /></svg>
<svg><use href="/icons.svg#icon-2" /></svg>
```

## Performance Metrics

### Inline SVG (5 icons)

```
HTML Size: +10KB (5 × 2KB SVG)
HTTP Requests: 0
LCP Impact: None
FCP: Instant
```

### next/image (5 icons)

```
File Size: 5 × 1KB = 5KB
HTTP Requests: 5
LCP Impact: Potential delay
FCP: Delayed until loaded
```

**Winner:** Inline SVG (zero requests, instant rendering)

## Decision Flowchart

```
Is it an icon/logo/small graphic (< 5KB)?
├─ YES → Use Inline SVG ✅
│  ├─ Single use → Direct component
│  ├─ From CMS → dangerouslySetInnerHTML
│  └─ Many repeated → SVG sprite
│
└─ NO → Is it a photo/large image?
   ├─ YES → Use next/image ✅
   │  ├─ Above fold → priority={true}
   │  └─ Below fold → loading="lazy"
   │
   └─ NO → Evaluate case-by-case
```

## Best Practices

### ✅ DO:

1. Inline SVG for icons (< 5KB)
2. next/image for photos (> 50KB)
3. SVG sprite for repeated icons
4. Optimize SVG files (remove metadata)
5. Use `aria-label` for accessibility

### ❌ DON'T:

1. ❌ Use next/image for small icons
2. ❌ Inline large images/photos
3. ❌ Create separate SVG files for each icon
4. ❌ Forget to optimize SVG code
5. ❌ Sacrifice performance for convenience

## Testing

### Verify Zero HTTP Requests

1. Open DevTools → Network tab
2. Reload page
3. Filter by "img" or "svg"
4. Count requests

**Expected:** 0 requests for inline SVG icons

### Verify Instant Rendering

1. Throttle network to "Slow 3G"
2. Reload page
3. Check if icons appear immediately

**Expected:** Icons visible instantly (in initial HTML)

## Tools

### Optimize SVG

```bash
# Install SVGO
npm install -g svgo

# Optimize
svgo input.svg -o output.svg
```

### Extract SVG from Figma

1. Select icon in Figma
2. Export as SVG
3. Open in text editor
4. Copy `<svg>...</svg>` code
5. Paste into WordPress ACF textarea

### Iconify (for standard icons)

```typescript
import { Icon } from '@iconify/react';

// Tree-shakable, only loads used icons
<Icon icon="mdi:phone" width={24} />
```

## Conclusion

**Performance-first philosophy:**
- Icons = Inline SVG (zero HTTP requests)
- Photos = next/image (optimization benefits)

**Never use next/image for icons - it violates the project's performance-first philosophy.**
