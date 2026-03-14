---
name: archive-filters-mobile-ui
description: Mobile UI для фильтров архивных страниц (врачи, акции). Use when implementing archive filters, adding mobile filter UI, or transferring filter pattern between archive pages.
---

# Archive Filters Mobile UI - УниДент

> Паттерн фильтрации на архивных страницах: desktop — inline-чипы, mobile — кнопка «Фильтры» + Sheet. Эталон: DoctorsFilters, PromotionsFilters.

## When to Use

**Используй этот skill когда:**
- Реализуешь фильтры на архивной странице (врачи, акции, услуги и т.д.)
- Переносишь UI фильтрации с одной архивной страницы на другую
- Добавляешь мобильную версию фильтров (кнопка + Sheet вместо inline-чипов)
- Нужно отобразить количество в активном чипе с правильным склонением («5 врачей», «23 акции»)

## Quick Reference

| Экран | Поведение |
|-------|-----------|
| Desktop (lg+) | Inline-чипы (flex-wrap) |
| Mobile (max-lg) | Кнопка «Фильтры» + Sheet справа, активные чипы под кнопкой |
| Touch targets | min-h-[44px] min-w-[44px] на чипах и кнопке сброса |
| Скрытие | Фильтр не показывается при `categories.length <= 1` (нет выбора) |

## Detailed Instructions

### Step 1: Структура компонента

```tsx
// Импорты
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/design-system";
import { getEntityWord } from "@/lib/utils/entity-plural"; // врач, акция и т.д.

// Chip-стили с touch targets
const chipBase = "px-4 py-2 rounded-[15px] text-sm font-medium transition-colors shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center";
const chipActive = "bg-unident-primary text-white";
const chipInactive = "bg-unident-bgTopbar text-unident-dark hover:bg-unident-bgElements";
```

### Step 2: Разделение Desktop / Mobile

```tsx
return (
  <div className="space-y-6">
    {/* Кнопка сброса */}
    <div className="relative min-h-[2.5rem]">
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="... min-h-[44px] min-w-[44px] inline-flex items-center"
          aria-label="Сбросить фильтр"
        >
          Сбросить фильтр
        </button>
      )}
    </div>

    {/* Desktop (lg+): inline-чипы */}
    <div className="hidden lg:block space-y-6">
      <FiltersContent />
    </div>

    {/* Mobile (max-lg): кнопка + Sheet */}
    <div className="lg:hidden">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button unidentVariant="outline" className="min-h-[44px] ...">
            <Filter /> Фильтры
            {hasActiveFilters && <span className="badge">1</span>}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
          <SheetHeader><SheetTitle>Фильтры</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-8">
            <FiltersContent withHeaders />
          </div>
        </SheetContent>
      </Sheet>
      {/* Активные чипы с количеством */}
      {hasActiveFilters && activeCategoryName && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={cn(chipBase, chipActive)}>
            {entityCount != null
              ? `${activeCategoryName} ${entityCount} ${getEntityWord(entityCount)}`
              : activeCategoryName}
          </span>
        </div>
      )}
    </div>
  </div>
);
```

### Step 3: FiltersContent с параметром withHeaders

Для Sheet — вертикальный layout с заголовками; для desktop — горизонтальный flex-wrap.

```tsx
const FiltersContent = ({ withHeaders = false }: { withHeaders?: boolean }) => (
  <div className="relative">
    {withHeaders && (
      <h3 className="text-sm font-semibold text-unident-dark mb-3">Категория</h3>
    )}
    <div className={cn(
      withHeaders ? "flex flex-col gap-5" : "flex flex-wrap items-start gap-2"
    )}>
      <button onClick={handleCategory(null)} className={cn(chipBase, !category ? chipActive : chipInactive, withHeaders && "w-full")}>
        Все [сущности]
      </button>
      <div className={cn("flex flex-wrap items-center gap-2", withHeaders ? "w-full" : "flex-1 min-w-0")}>
        {visibleCategories.map((cat) => (
          <button key={cat.id} onClick={handleCategory(cat.slug)} className={cn(chipBase, category === cat.slug ? chipActive : chipInactive)}>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  </div>
);
```

### Step 4: Pluralization helper

Создать `lib/utils/{entity}-plural.ts` по образцу `doctor-plural.ts`:

```ts
export type EntityWord = "врач" | "врача" | "врачей"; // или "акция" | "акции" | "акций"

export function getEntityWord(count: number): EntityWord {
  const n = Math.abs(Math.floor(count));
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (n === 1 || (mod10 === 1 && mod100 !== 11)) return "врач";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "врача";
  return "врачей";
}
```

### Step 5: Scroll position preservation

При смене фильтра сохранять scroll и восстанавливать после навигации:

```tsx
// В updateFilters:
if (typeof window !== "undefined") {
  sessionStorage.setItem("archive-scroll-y", String(window.scrollY));
}
startTransition(() => router.push(target, { scroll: false }));
setSheetOpen(false);

// В родительском компоненте (archive-section-client):
useLayoutEffect(() => {
  const saved = sessionStorage.getItem("archive-scroll-y");
  if (saved !== null) {
    sessionStorage.removeItem("archive-scroll-y");
    window.scrollTo(0, Math.min(Number(saved), document.body.scrollHeight - window.innerHeight));
  }
}, [initialData]);
```

## Common Errors

### Error: Фильтр показывается при одной категории

**Cause:** Нет проверки `categories.length > 1`
**Fix:** `if (!showCategoryFilter) return null` в начале компонента

### Error: Touch targets слишком маленькие

**Cause:** Чипы без min-h/min-w
**Fix:** Добавить `min-h-[44px] min-w-[44px] inline-flex items-center justify-center` в chipBase

### Error: Количество без склонения («5 акция»)

**Cause:** Нет pluralization helper
**Fix:** Создать `getPromotionWord` / `getDoctorWord` и использовать в активном чипе

## Best Practices

### DO

1. Использовать breakpoint `lg` (1024px) для переключения desktop/mobile
2. Закрывать Sheet при выборе фильтра (`setSheetOpen(false)` в updateFilters)
3. Передавать `entityCount` из родителя (promotions.length, doctors.length)
4. Сохранять scroll в sessionStorage при смене фильтра

### DON'T

1. Не показывать inline-чипы на mobile — они занимают много места
2. Не забывать aria-label на кнопке «Фильтры» и «Сбросить фильтр»
3. Не использовать index как key в списке категорий

## References

- Эталон: `nextjs/src/components/sections/doctors-filters.tsx`
- Эталон: `nextjs/src/components/sections/promotions-filters.tsx`
- Plural: `nextjs/src/lib/utils/doctor-plural.ts`, `nextjs/src/lib/utils/promotion-plural.ts`
- Related: `.cursor/skills/responsive-adaptive-design/SKILL.md`
