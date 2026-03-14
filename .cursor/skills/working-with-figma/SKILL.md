---
name: working-with-figma
description: Work with Figma MCP - cache management, batch image downloads, font replacement, pixel-perfect implementation. Use when working with Figma designs, downloading icons/images, replacing commercial fonts with free alternatives, or implementing components from Figma.
---

# Working with Figma

## MCP Server Identifiers

- **Figma Remote** → `user-Figma` (PRIMARY — без ограничений плана)
- **Figma Desktop** → `user-Figma_Desktop`
- **Framelink** → `user-Framelink MCP for Figma`

⚠️ `plugin-figma-figma` и `plugin-figma-figma-desktop` привязаны к Starter плану (6 вызовов в месяц) — не использовать.

При вызове get_design_context, get_screenshot, get_variable_defs использовать `user-Figma` или `user-Figma_Desktop`; для get_figma_data и download_figma_images — Framelink.

## Two MCP servers and cache per source

**Two MCP servers — different data, they complement each other:**

1. **Framelink MCP for Figma** — precise layout numbers (dimensions, gap, padding, borderRadius, typography), image/SVG downloads.
2. **Figma** (Figma Remote or Figma Desktop) — code draft (`get_design_context`), variables, screenshot. Data is **different** and **complementary**. Both sources are always needed for the best result.

**Cache:** Use `nextjs/figma-data/FIGMA_CACHE.md` and `nextjs/figma-data/`. For **each source** separately:

- **Framelink data** (layout numbers for a nodeId): If cache has this data for the node → use cache. If not → request **Framelink MCP** (`get_figma_data`, and if needed `download_figma_images`).
- **Figma data** (design context, structure, code): If cache has data for the node → use cache. If not → request **Figma MCP** (`get_design_context`, etc.).

**Result:** Always have data from both sources (from cache or by request). Do not skip either MCP; more information = better implementation.

**Project Figma File Keys:**
- Оригинал: `JPVOauS3F3bEIy1msJXPeR`
- Copy (активный): `eEN4I9HdQ3JiW708BuOMRc`

## Three-MCP workflow (pixel-perfect)

При реализации блока из Figma **всегда** получать оба источника: Framelink (точные числа) и Figma (черновик кода). Для каждого источника: если данные по узлу есть в кэше — взять из кэша; иначе вызвать соответствующий MCP (Framelink или Figma). Сопоставляешь оба набора (числа из Framelink, структура из черновика), затем проверка по скриншоту.

**Fallback:** если Figma MCP не подключён — использовать только Framelink (числа будут, черновика кода не будет).

Порядок вызовов:

1. **Framelink** `get_figma_data(fileKey, nodeId)` — эталонные layout-числа (dimensions, gap, padding, borderRadius, typography). Обязательно.
2. **Figma Remote** `get_design_context` или **Figma Desktop** `get_design_context` — черновик структуры/кода (React+Tailwind). Обязательно. При расхождении чисел с Framelink подставлять значения из Framelink.
3. **Framelink** `download_figma_images` — загрузка SVG/изображений.
4. **Figma Desktop** или **Figma Remote** `get_screenshot` — визуальная проверка после реализации.

## Figma Desktop MCP — настройки и путь

**Где настройки в Figma:**
1. Dev Mode (Shift+D) → правая панель **Inspect** (не Plugins)
2. Секция **MCP server** → при необходимости кнопка **Open settings modal** (открывает Image source, Allow overwriting, Code Connect)
3. Image source: **Download** | Allow overwriting: ✓

**При каждом вызове Figma Desktop `get_design_context` обязательно передавать:**
```
dirForAssetWrites: "D:/template/nextjs/public/images/figma"
```
Без этого параметра инструмент вернёт ошибку "Path for asset writes as tool argument is required".

## Batch Image Downloads

When getting new component:

```typescript
// 1. Find ALL IMAGE-SVG and IMAGE nodes
const nodes = [
  { nodeId: "123:894", fileName: "icon-1.svg" },
  { nodeId: "95:2361", fileName: "icon-2.svg" },
  // ... all icons at once
];

// 2. Download with ONE request
// localPath: "nextjs/public/images/figma" (относительно cwd MCP)
mcp_Framelink_MCP_for_Figma_download_figma_images({
  fileKey: "JPVOauS3F3bEIy1msJXPeR",
  nodes: nodes, // ALL at once!
  localPath: "nextjs/public/images/figma",
});
```

**DON'T:** Separate requests for each icon.

**Post-step (Framelink path workaround):** Framelink `download_figma_images` разрешает `localPath` относительно cwd MCP. Если cwd = домашняя папка (`C:\Users\[user]`), файлы попадут в `C:\Users\[user]\nextjs\public\images\figma`. После вызова проверить обе папки и скопировать недостающие файлы в `D:\template\nextjs\public\images\figma`. В `.cursor/mcp.json` задан `cwd: "${workspaceFolder}"` — при корректном запуске MCP из корня проекта файлы должны сохраняться в проект.

## Update Cache After Request

After successful Figma request:

1. Save JSON to `figma-data/components/[name].json`
2. Update `FIGMA_CACHE.md` (add component, describe structure, list files)

## Font Replacement

### Use next/font (ALWAYS)

**For Google Fonts:**

```typescript
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"], // ✅ REQUIRED for Russian
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap", // ✅ REQUIRED for performance
});
```

**NEVER:**
- ❌ CDN in `@font-face`
- ❌ `@import url('https://fonts.googleapis.com/...')`

### Free Alternatives for Commercial Fonts

| Commercial | Free Alternative | Similarity | Cyrillic |
|------------|------------------|------------|----------|
| Gilroy | Montserrat | 80% | ✅ |
| Gilroy | Red Hat Display | 90% | ✅ (slow compile) |
| Gilroy | Inter | 60% | ✅ |
| Circular | Nunito Sans | 75% | ✅ |
| Avenir | Montserrat | 70% | ✅ |
| Proxima Nova | Inter | 65% | ✅ |

**Process:**
1. Identify original characteristics (geometric, sans-serif, etc.)
2. Find analog via Google Fonts
3. Check Cyrillic support: `subsets: ['cyrillic']`
4. Visual comparison: run with new font, screenshot, compare

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui"],
        montserrat: ["var(--font-montserrat)", "system-ui"],
        // Alias for compatibility:
        gilroy: ["var(--font-montserrat)", "system-ui"],
      },
    },
  },
};
```

## Pixel-Perfect Implementation

### Exact Values from Figma

**Sizes:**
```typescript
// ✅ Correct (from Figma)
className="w-[67.26px] h-[67.26px]"

// ❌ Wrong (rounded)
className="w-16 h-16"
```

**Colors:**
```typescript
// ✅ Correct
className="bg-[#D9E4F7]"

// ❌ Wrong
className="bg-blue-100"
```

**Border Radius:**
```typescript
// ✅ Correct
rounded-tl-[61px] rounded-tr-none

// ❌ Wrong
rounded-t-xl
```

**Typography:**
```typescript
// ✅ Correct (from Figma)
className="text-[17px] font-medium tracking-[-0.04em]"

// ❌ Wrong
className="text-base font-semibold"
```

### Check Details

- ✅ Direction of "droplets" and corners
- ✅ Border-radius order (tl, tr, bl, br)
- ✅ Spacing and gaps between elements
- ✅ Text alignment (center, left, right)
- ✅ Transform and rotation of icons

**Example:**
```typescript
// Droplet with sharp corner TOP RIGHT:
<div className="rounded-tl-[61px] rounded-tr-none ...">
  {/* Sharp corner on the right - correct! */}
</div>
```

## Debugging

### Font Not Applying

1. Check import in `layout.tsx`
2. Check `className={font.variable}` in `<html>`
3. Check CSS variable in `globals.css`
4. Clear cache: `rm -rf .next && npm run dev`
5. Restart browser (Ctrl+Shift+R)

### Figma API 429 (Rate Limit)

1. Use cache `FIGMA_CACHE.md`
2. Don't retry immediately
3. Wait 1-2 minutes
4. Explain to user

### No Cyrillic

```typescript
// Add cyrillic subset
const font = Montserrat({
  subsets: ["latin", "cyrillic"], // ✅ REQUIRED
});
```

## Performance Metrics

After optimization:

| Metric | Before (CDN) | After (next/font) |
|--------|--------------|-------------------|
| FCP | ~1.5s | ~0.9s ⚡ |
| Font Load | ~500ms | ~200ms ⚡ |
| External Requests | +5 | 0 ⚡ |
| Lighthouse Score | 70-80 | 90-95 ⚡ |

## Font Checklist

- [ ] Font loads via `next/font/google` or `next/font/local`
- [ ] Added `subsets: ['cyrillic']` for Russian
- [ ] Added `display: 'swap'` for performance
- [ ] Updated `tailwind.config.js`
- [ ] Updated `globals.css` (removed CDN imports)
- [ ] Verified in DevTools (font-family)
- [ ] Verified in Network (no CDN requests)
- [ ] Screenshot for comparison
- [ ] Lighthouse score 90+
