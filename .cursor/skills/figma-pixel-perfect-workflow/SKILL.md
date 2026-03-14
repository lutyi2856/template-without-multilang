---
name: figma-pixel-perfect-workflow
description: Comprehensive workflow for pixel-perfect Figma to code implementation. Prevents common errors (wrong element count, mismatched sizes, spacing issues). Use when implementing designs from Figma, experiencing layout discrepancies, or need systematic quality control.
---

# Figma Pixel-Perfect Workflow

> Comprehensive system to prevent and catch Figma implementation errors
> Solves: Wrong element count, size mismatches, spacing issues, hours of fixes

## MCP Server Identifiers

- **Figma Remote** → `user-Figma` (PRIMARY — без ограничений плана)
- **Figma Desktop** → `user-Figma_Desktop`
- **Framelink** → `user-Framelink MCP for Figma`

⚠️ `plugin-figma-figma` и `plugin-figma-figma-desktop` привязаны к Starter плану (6 вызовов в месяц) — не использовать.

## 🎯 Core Problem

**Symptoms:**
- "Need 2 cards, got 1" - wrong element count
- Width/height don't match design
- Spacing/padding incorrect
- Hours spent fixing small mistakes

**Root Causes:**
1. Implementing without full design understanding
2. No validation before coding
3. Guessing values instead of extracting exact data
4. Missing cross-validation between sources

---

## 🏗️ SOLUTION 1: Two-Phase Workflow (MOST IMPORTANT)

**Phase 1 - Extraction (DON'T CODE YET!)**

```bash
# Step 1: Extract ALL data from Figma BEFORE coding
1. Design tokens (colors, typography, spacing)
2. Exact measurements (widths, heights, positions)
3. Visual reference (screenshots)
4. Component structure (how many elements, hierarchy)
5. Layout system (flex vs grid)
```

**Phase 2 - Review Checkpoint**

```
✅ Review extracted data:
- Colors match? (check hex values)
- Measurements accurate? (check px values)
- Element count correct? (check component structure)
- Layout type clear? (flex, grid, block?)

❌ DON'T proceed until data is verified!
```

**Phase 3 - Implementation**

Only after review → implement from extracted data (not from Figma again).

**Why This Works:**
- Catch errors BEFORE coding (saves hours)
- No guessing - all values extracted
- Cross-validate across multiple sources

**Time Savings:** 
- Without: 4 hours implementation + 2 hours fixes = 6 hours
- With: 15 min extraction + 5 min review + 1.5 hours implementation = 2 hours

---

## 🔍 SOLUTION 2: Multi-Source Validation (5 Sources of Truth)

**Use FIVE different data sources to cross-validate:**

### 1. Variable Definitions (Design Tokens)
```typescript
// Extract from Figma Variables
Colors: #526AC2 (unident-primary)
Typography: 22px, font-semibold, -0.02em tracking
Spacing: 24px gap, 32px padding
```

### 2. Metadata (Exact Measurements)
```typescript
// From Figma metadata API
Width: 347px (not 350px!)
Height: 521px (exact)
Gap: 16px (between cards)
Border radius: 25px (not rounded-3xl)
```

### 3. Visual Reference (Screenshot)
```
Screenshot from Figma → compare with browser
- Element count: 2 cards visible? ✅
- Alignment: centered? ✅
- Spacing: looks correct? ✅
```

### 4. Design Context (Layout Structure)
```typescript
// From Figma structure
Container: flex (not grid!)
Direction: row (horizontal)
Children count: 2 (TWO cards)
Gap: 16px
```

### 5. Code Connect Map (Existing Patterns)
```typescript
// Check if similar component exists
Found: CardComponent (reuse?)
Pattern: flex layout with gap-4
```

**How to Use:**
```
1. Extract all 5 sources
2. Compare values across sources:
   - All say "2 cards"? ✅ Correct
   - One says "1 card"? ❌ Investigate
   
3. If mismatch → trust majority (3+ sources)
```

**Example: Catching "Wrong Card Count" Error**

```typescript
Source 1 (Variables): Cards array length = 2 ✅
Source 2 (Metadata): 2 child frames detected ✅
Source 3 (Screenshot): Shows 2 cards ✅
Source 4 (Structure): parent.children.length = 2 ✅
Source 5 (Code pattern): Similar component has 2 cards ✅

Result: Confident that design requires 2 cards
```

---

## 📏 SOLUTION 3: Component Size Limits

**Problem:** AI struggles with large components → makes mistakes

**Solution: Break into smaller pieces**

### Size Guidelines

**✅ Small (< 2,000 tokens) - BEST**
- Single UI elements: Button, Card, Input
- Single sections: Hero, Feature card
- Time: 2-5 min, near pixel-perfect

**✅ Medium (2,000-12,000 tokens) - GOOD**
- Widgets: Product card with details
- Form sections with validation
- Time: 5-10 min, high quality

**❌ Large (> 12,000 tokens) - AVOID**
- Complex widgets, dashboards, multi-step forms
- Time: 10-20+ min, needs careful review
- Better: Break down into smaller components

**How to Check:**
```
In Figma Dev Mode → token count shown next to link
OR
Count layers: > 100 layers? Consider splitting
```

### Break Down Strategy

**❌ WRONG - Implement entire page at once:**
```
Hero + Features + Services + Testimonials + Footer = 30,000 tokens
Result: AI confused, wrong element counts, bad spacing
```

**✅ RIGHT - Component by component:**
```
Step 1: Hero (2,000 tokens) → Perfect ✅
Step 2: Features section (3,000 tokens) → Perfect ✅
Step 3: Services grid (4,000 tokens) → Perfect ✅
Step 4: Compose together → Perfect ✅
```

---

## 🎨 SOLUTION 4: Visual Comparison Workflow

**Use Figma overlay to catch pixel differences**

### Method A: Figma Testing Library (Automated)

```typescript
// Install in project
<script type="module" src="https://unpkg.com/figma-testing-library"></script>

// Wrap component
<ftl-holster 
  token="YOUR_FIGMA_TOKEN"
  file-id="YOUR_FILE_ID"
  node-id="467:993">
  
  <YourComponent /> <!-- Your code -->
  
</ftl-holster>
```

**Features:**
- Toggle overlay on/off
- Adjust opacity
- Quick visual validation

### Method B: Manual Overlay (Fallback)

```bash
# If automated tool doesn't work:
1. Screenshot browser (Cmd+Shift+4)
2. Import screenshot to Figma
3. Align over design
4. Toggle opacity to compare
```

**What to Check:**
```
✅ Element count matches
✅ Sizes match (width/height)
✅ Spacing matches (gaps, padding)
✅ Border radius correct
✅ Colors exact (not "close")
✅ Typography matches (size, weight, tracking)
```

---

## 🤖 SOLUTION 5: Improved AI Prompting

**Problem:** Vague prompts → AI guesses → mistakes

**Solution: Detailed, structured prompts**

### Template: Figma Implementation Prompt

```
CONTEXT:
- Framework: Next.js 14 + TypeScript
- Styling: Tailwind CSS v4
- Design System: ./src/components/design-system
- Component path: ./src/components/[NAME]

FIGMA URL:
[Paste Figma link with node-id]

REQUIREMENTS:
1. EXTRACT FIRST (Phase 1):
   - All design tokens (colors, spacing, typography)
   - Exact measurements (widths, heights, gaps)
   - Component structure (element count, hierarchy)
   - Layout system (flex vs grid)
   - Save extracted data to temp file for review

2. VALIDATE (Phase 2):
   - Cross-check all 5 data sources
   - Confirm element count matches design
   - Verify all measurements are exact (not rounded)
   - Show me extracted data for review

3. IMPLEMENT (Phase 3 - ONLY AFTER MY APPROVAL):
   - Use extracted data (not Figma API again)
   - Mobile-first responsive (sm: md: lg:)
   - Use design-system components where applicable
   - Exact values (not Tailwind approximations)

SPECIFIC CHECKS:
- How many cards/items in this design? [NUMBER]
- What layout system? (flex, grid, block)
- What are EXACT dimensions? (width, height)
- What are EXACT colors? (hex values)

DON'T:
- ❌ Round values (347px → 350px)
- ❌ Use approximate colors (bg-blue-500 instead of #526AC2)
- ❌ Guess element count
- ❌ Skip extraction phase
```

**Why This Works:**
- Forces AI to extract before implementing
- Requires explicit validation checkpoint
- Specifies project conventions
- Prevents common mistakes

---

## ✅ SOLUTION 6: Pre-Implementation Checklist

**Before writing ANY code:**

### Design Understanding
```
[ ] Opened Figma file in Dev Mode
[ ] Identified ALL elements (counted cards, sections, items)
[ ] Noted layout system (flex, grid, block)
[ ] Checked for variants/states (hover, active, disabled)
[ ] Identified responsive breakpoints (mobile, tablet, desktop)
```

### Data Extraction
```
[ ] Colors extracted (exact hex values)
[ ] Typography extracted (size, weight, line-height, tracking)
[ ] Spacing extracted (padding, margin, gap)
[ ] Dimensions extracted (width, height)
[ ] Border radius extracted (exact px values)
[ ] Shadows extracted (if any)
```

### Component Structure
```
[ ] Element count verified (how many cards/items?)
[ ] Hierarchy mapped (parent → children → grandchildren)
[ ] Relationships identified (which elements inside which?)
[ ] Repeated patterns noted (can use map/loop?)
```

### Cross-Validation
```
[ ] Checked 5 data sources agree
[ ] Screenshot saved for comparison
[ ] Existing similar component found (reuse?)
[ ] Design tokens match project style guide
```

**Time Investment:** 10-15 minutes
**Time Saved:** 2-4 hours of fixes

---

## 🧪 SOLUTION 7: Post-Implementation QA

**After implementation, systematic testing:**

### Visual Comparison
```bash
# 1. Open component in browser
# 2. Take screenshot
# 3. Overlay in Figma OR use Figma Testing Library
# 4. Check at multiple breakpoints:

Breakpoints to test:
- 375px (mobile)
- 768px (tablet)
- 1024px (desktop)
- 1440px (large desktop)
```

### Measurement Validation
```typescript
// Use browser DevTools
1. Inspect element
2. Check computed styles:
   - Width: 347px? ✅ (should match Figma exactly)
   - Height: 521px? ✅
   - Padding: 24px 32px? ✅
   - Gap: 16px? ✅
   - Border-radius: 25px? ✅
```

### Element Count Validation
```typescript
// In browser console:
document.querySelectorAll('.card').length // Should match Figma count

// Example:
// Figma shows 2 cards → querySelectorAll should return 2
// If returns 1 → ERROR, fix needed
```

### Color Validation
```typescript
// In DevTools, check computed color:
getComputedStyle(element).backgroundColor
// "rgb(82, 106, 194)" = #526AC2 ✅

// NOT:
// "rgb(59, 130, 246)" = #3B82F6 (wrong blue!)
```

### Typography Validation
```typescript
// Check computed styles:
font-size: 22px ✅ (not 20px or 24px)
font-weight: 600 ✅ (not 700)
line-height: 26.18px ✅ (1.19 ratio)
letter-spacing: -0.44px ✅ (-0.02em)
```

---

## 🚀 SOLUTION 8: Automated Testing (Advanced)

**For design systems, automate pixel-perfect checks:**

### Setup Playwright Visual Tests

```typescript
// tests/visual/doctor-card.spec.ts
import { test, expect } from '@playwright/test';

test('doctor card matches Figma design', async ({ page }) => {
  await page.goto('/components/doctor-card');
  
  // Visual regression test
  await expect(page.locator('.doctor-card')).toHaveScreenshot(
    'doctor-card-desktop.png',
    { threshold: 0.01 } // 99% match required
  );
  
  // Test responsive
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('.doctor-card')).toHaveScreenshot(
    'doctor-card-mobile.png',
    { threshold: 0.01 }
  );
});
```

### Measurement Tests

```typescript
test('doctor card has correct dimensions', async ({ page }) => {
  await page.goto('/components/doctor-card');
  
  const card = page.locator('.doctor-card');
  const box = await card.boundingBox();
  
  // Exact measurements from Figma
  expect(box?.width).toBe(347);
  expect(box?.height).toBe(521);
  
  // Check spacing
  const gap = await page.evaluate(() => {
    const el = document.querySelector('.doctor-card');
    return getComputedStyle(el!).gap;
  });
  expect(gap).toBe('16px');
});
```

---

## 📋 Complete Workflow Example

**Scenario: Implement "Doctor Card" from Figma**

### Step 1: Pre-Implementation (10 min)

```bash
✅ Open Figma, enable Dev Mode
✅ Count elements: 2 cards visible
✅ Note layout: flex, direction: row, gap: 16px
✅ Extract design tokens:
   - bg: #FFFFFF
   - border: 2px solid #D8D8D8
   - radius: 25px
   - padding: 24px
   
✅ Extract typography:
   - Name: 22px, semibold, -0.02em
   - Description: 16px, normal, -0.01em
   
✅ Save screenshot for comparison
✅ Check existing Card component (reuse?)
```

### Step 2: Extraction Phase (5 min)

```typescript
// Prompt AI:
"Extract ALL data from this Figma component FIRST.
DON'T implement yet. Give me:
1. Design tokens (colors, spacing, typography)
2. Exact measurements
3. Component structure (how many elements?)
4. Layout system

Figma URL: [paste link]"

// AI Response (review this!):
{
  "elementCount": 2,
  "layout": "flex",
  "gap": "16px",
  "cardWidth": "347px",
  "cardHeight": "521px",
  "borderRadius": "25px",
  "colors": {
    "bg": "#FFFFFF",
    "border": "#D8D8D8"
  }
}
```

### Step 3: Review Checkpoint (5 min)

```
Cross-validate:
✅ Element count: 2 (matches Figma visual) ✅
✅ Layout: flex (makes sense for horizontal cards) ✅
✅ Gap: 16px (checked in Figma Dev Mode) ✅
✅ Width: 347px (exact from metadata) ✅
✅ Colors: Exact hex match ✅

Approve? YES → Proceed to implementation
```

### Step 4: Implementation (30 min)

```tsx
// Now AI can implement with confidence:
interface DoctorCardData {
  name: string;
  specialty: string;
  experience: number;
  avatar: string;
}

export function DoctorCardsSection({ doctors }: { doctors: DoctorCardData[] }) {
  return (
    <div className="flex gap-4"> {/* Exact gap from extraction */}
      {doctors.slice(0, 2).map((doctor) => ( {/* Exactly 2 cards */}
        <Card
          key={doctor.name}
          variant="bordered"
          className="w-[347px] h-[521px]" {/* Exact dimensions */}
        >
          <Image
            src={doctor.avatar}
            alt={doctor.name}
            width={300}
            height={300}
          />
          <Heading level={3} variant="doctor-name">
            {doctor.name}
          </Heading>
          <Text variant="doctor-description">
            {doctor.specialty}
          </Text>
        </Card>
      ))}
    </div>
  );
}
```

### Step 5: Post-Implementation QA (10 min)

```bash
# Visual comparison
1. Open in browser: http://localhost:3000/doctors
2. Use Figma Testing Library to overlay design
3. Toggle opacity to compare

# Measurement validation
4. Open DevTools
5. Inspect card element:
   Width: 347px ✅
   Height: 521px ✅
   Gap: 16px ✅
   
6. Count elements:
   document.querySelectorAll('.card').length // 2 ✅

# Screenshot for reference
7. browser_take_screenshot → save to /screenshots/
```

### Total Time: ~60 min (vs 4-6 hours without workflow)

---

## 🎯 Quick Reference: Error Prevention

### Common Error: Wrong Element Count

**Prevention:**
```
Phase 1 - Extraction:
"How many [cards/items/sections] in this design?"

Phase 2 - Review:
Count visually in Figma screenshot ✅
Count in metadata (children.length) ✅
Count in design context ✅

Phase 3 - Implementation:
Use slice(0, N) or take(N) to enforce count
```

### Common Error: Wrong Dimensions

**Prevention:**
```
Phase 1 - Extraction:
Extract EXACT px values from metadata

Phase 2 - Review:
✅ 347px (exact) NOT 350px (rounded)
✅ 521px (exact) NOT 520px (rounded)

Phase 3 - Implementation:
className="w-[347px] h-[521px]" // Exact arbitrary values
```

### Common Error: Wrong Spacing

**Prevention:**
```
Phase 1 - Extraction:
Extract gap, padding, margin separately

Phase 2 - Review:
gap: 16px ✅ (not 12px or 20px)
padding: 24px ✅ (all sides)

Phase 3 - Implementation:
className="flex gap-4" // 16px = gap-4
className="p-6" // 24px = p-6
```

### Common Error: Wrong Colors

**Prevention:**
```
Phase 1 - Extraction:
Extract exact hex values

Phase 2 - Review:
#526AC2 ✅ (exact primary blue)
NOT #3B82F6 (Tailwind blue-500)

Phase 3 - Implementation:
className="bg-unident-primary" // Design system color
OR
className="bg-[#526AC2]" // Exact hex if no token
```

---

## 🔧 Tools & Resources

### Essential Tools

1. **Figma Dev Mode** (built-in)
   - Shows exact measurements
   - Provides node IDs
   - Token count visible

2. **Figma Testing Library** (optional)
   ```bash
   npm install figma-testing-library
   ```
   - Visual overlay in browser
   - Quick toggle on/off
   - Opacity control

3. **Playwright** (for automated testing)
   ```bash
   npm install -D @playwright/test
   ```
   - Visual regression tests
   - Measurement validation
   - Multi-breakpoint testing

4. **Browser DevTools** (built-in)
   - Inspect computed styles
   - Measure dimensions
   - Validate colors

### Helper Scripts

```typescript
// scripts/validate-figma.ts
// Check component matches Figma measurements

interface FigmaSpec {
  width: number;
  height: number;
  gap: number;
  elementCount: number;
}

export async function validateComponent(
  selector: string,
  spec: FigmaSpec
) {
  const element = document.querySelector(selector);
  if (!element) throw new Error('Element not found');
  
  const box = element.getBoundingBox();
  const children = element.children.length;
  const gap = getComputedStyle(element).gap;
  
  return {
    width: box.width === spec.width,
    height: box.height === spec.height,
    gap: parseInt(gap) === spec.gap,
    elementCount: children === spec.elementCount,
  };
}
```

---

## 📊 Success Metrics

**Track improvements:**

### Before Workflow
- Time per component: 4-6 hours (implementation + fixes)
- Error rate: 60-80% (multiple revisions needed)
- Designer revisions: 4-5 rounds
- Precision: "pixel pretty close"

### After Workflow
- Time per component: 1-2 hours (including validation)
- Error rate: 10-20% (minor tweaks only)
- Designer revisions: 0-1 round
- Precision: Pixel-perfect (99%+ match)

### ROI Calculation
```
Old way: 6 hours × $100/hour = $600 per component
New way: 2 hours × $100/hour = $200 per component

Savings: $400 per component
Over 50 components: $20,000 saved
```

---

## 🚨 Troubleshooting

### Issue: Still getting wrong element count

**Solutions:**
1. Be more explicit in prompt: "This design has EXACTLY 2 cards"
2. Use slice/take in implementation: `doctors.slice(0, 2)`
3. Show AI the screenshot: "Count the cards in this image"

### Issue: Dimensions still slightly off

**Solutions:**
1. Use exact arbitrary values: `w-[347px]` not `w-[350px]`
2. Check Figma measurement includes borders/padding
3. Verify browser zoom is 100% (not 110% or 90%)

### Issue: Colors don't match exactly

**Solutions:**
1. Extract exact hex: `#526AC2` not Tailwind approximation
2. Check color profile (sRGB vs Display P3)
3. Use color picker on screenshot to verify

### Issue: Spacing incorrect

**Solutions:**
1. Distinguish gap vs padding vs margin
2. Check if Figma shows inner vs outer spacing
3. Use browser DevTools computed tab to verify

---

## 📚 Related Skills

- `working-with-figma` - Cache management, batch downloads
- `design-system-usage` - Using project design tokens
- `nextjs-wordpress-dynamic-routing` - Implementation patterns
- `playwright-browser-testing` - Automated visual testing

---

**Status:** ✅ Production-ready workflow
**Priority:** 🔴 CRITICAL for Figma implementations
**Version:** 1.0.0
**Last Updated:** 2026-02-05
