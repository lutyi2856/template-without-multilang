---
name: kan-donor-services-prices
description: Work with KAN donor site services/prices cache. Use when updating prices data from kan.uz, finding data source, re-extracting services-prices, or integrating UZS/сум currency.
---

# KAN Donor: кэш услуг и цен

## When to Use

**Use this skill when:**
- Updating services/prices data from donor site kan.uz
- Finding where donor data is stored
- Re-extracting or refreshing the services-prices cache
- Integrating UZS (сум) currency display in frontend
- Planning import of services/prices into WordPress (taxonomy, Price CPT)

---

## Quick Reference

| Item | Value |
|------|-------|
| **Source URL** | https://kan.uz/uslugi-i-czeny/ |
| **Cache file** | `kan-data/services-prices.json` |
| **Run extraction** | `npm run extract-kan-services-prices` (from project root) |
| **Import to WP** | `npm run import-kan-services-prices` (copies kan-data + script, runs import) |
| **Delete fake data** | `scripts/delete-fake-services-prices.php` — удаляет старые services/prices, оставляет только KAN |
| **Analyze duplicates** | `npm run analyze-price-duplicates` — donor; `npm run analyze-price-duplicates-wp` — WP (Docker) |
| **Currency config** | `nextjs/src/lib/currency.ts` |
| **UZS symbol** | "сум" (via `getCurrencySymbol("UZS")`) |

---

## Data Structure

```ts
// Root
{
  sourceUrl: string;
  fetchedAt: string;      // ISO 8601
  currency: "UZS";
  currencySymbol: "сум";
  categories: PriceCategory[];
}

// PriceCategory
{
  name: string;           // H2: "Исправление прикуса"
  subcategories: PriceSubcategory[];
}

// PriceSubcategory
{
  title?: string;         // H4: "Лечение на элайнерах Invisalign"
  subtitle?: string;     // Optional description for subcategory
  items: PriceItem[];
}

// PriceItem
{
  name: string;
  price: number;          // Integer (no dots)
  fromPrefix?: boolean;   // "от" prefix
  description?: string;   // "(Включая осмотр...)"
}
```

---

## Detailed Instructions

### Step 1: Re-extract from donor

```bash
cd d:\template
npm run extract-kan-services-prices
```

Or directly:

```bash
node scripts/extract-kan-services-prices.mjs
```

### Step 2: Read cache in code

```ts
import servicesPrices from "../../kan-data/services-prices.json";

const categories = servicesPrices.categories;
const currency = servicesPrices.currencySymbol; // "сум"
```

### Step 3: Display currency symbol (frontend)

```ts
import { getCurrencySymbol } from "@/lib/currency";

const symbol = getCurrencySymbol("UZS");  // "сум"
const symbolRub = getCurrencySymbol("RUB"); // "₽"
```

---

## Common Errors

### Error: "Fetch failed: 403" or network error

**Cause:** Donor site may block requests or rate-limit.

**Fix:** Re-run later; ensure User-Agent header is set (script uses Mozilla/5.0).

### Error: Categories empty or items missing

**Cause:** Donor HTML structure changed.

**Fix:** Update `CATEGORY_NAMES` in script; adjust regex in `extractItemsFromBlock`.

---

## Best Practices

### DO

1. Run extraction periodically when donor prices may have changed
2. Use `getCurrencySymbol(currency)` for all price displays (PriceTable, ActionCard, Header)
3. Keep `nextjs/src/lib/currency.ts` as single source for currency symbols
4. Add new currency codes to `CURRENCY_SYMBOLS` if needed

### DON'T

1. Don't modify JSON structure without updating the extraction script
2. Don't hardcode "₽" or "сум" in components — use `getCurrencySymbol`
3. Don't forget to run extraction after donor site content updates
