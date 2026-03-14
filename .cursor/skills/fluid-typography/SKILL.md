---
name: fluid-typography
description: Fluid typography через clamp() для всех text tokens (body, heading, figma). Use when implementing responsive typography, replacing max-md:text-[Npx] with smooth scaling, adding text tokens, fixing font-size jumps at breakpoints, or working with typography.ts. Viewport 375–1440px, Desktop-First.
---

# Fluid Typography

> Плавное масштабирование font-size между viewport 375px (mobile) и 1440px (desktop). Desktop-First: desktop = max значение, mobile = min. Заменяет скачки на breakpoints (`max-md:text-[Npx]`) на линейное изменение.

## When to Use

**Используй этот skill когда:**
- Добавляешь новый text token с responsive размерами
- Заменяешь `text-[Npx] max-md:text-[Mpx]` на плавное масштабирование
- Нужна fluid типографика для body, heading или figma-токенов
- Текст «прыгает» на breakpoint 768px — нужен плавный переход

## Quick Reference

### Формула clamp

```
slope = (maxFontSize - minFontSize) / (maxViewport - minViewport)
preferred = minFontSize - minViewport * slope + slope * 100vw
clamp(minFontSize, preferred, maxFontSize)
```

**Viewport:** 375px (mobile) → 1440px (desktop). Desktop = max.

### Tailwind arbitrary value

```tsx
className="text-[clamp(1rem,0.94rem+0.19vw,1.125rem)]"
```

### Таблица body (viewport 375–1440)

| Token   | Min  | Max  | clamp()                                    |
| ------- | ---- | ---- | ------------------------------------------ |
| default | 14px | 16px | `clamp(0.875rem,0.82rem+0.19vw,1rem)`      |
| large   | 16px | 18px | `clamp(1rem,0.94rem+0.19vw,1.125rem)`      |
| small   | 13px | 14px | `clamp(0.8125rem,0.77rem+0.09vw,0.875rem)` |
| xs      | 11px | 12px | `clamp(0.6875rem,0.64rem+0.09vw,0.75rem)`  |

### Таблица heading

| Token         | Min  | Max  | clamp()                                  |
| ------------- | ---- | ---- | ---------------------------------------- |
| page-title    | 36px | 48px | `clamp(2.25rem,1.99rem+1.13vw,3rem)`     |
| section-title | 28px | 32px | `clamp(1.75rem,1.62rem+0.38vw,2rem)`     |
| card-title    | 20px | 22px | `clamp(1.25rem,1.18rem+0.19vw,1.375rem)` |
| subsection    | 18px | 20px | `clamp(1.125rem,1.06rem+0.19vw,1.25rem)` |

### Таблица figma (примеры)

| Token                         | Min  | Max  | clamp()                                   |
| ----------------------------- | ---- | ---- | ----------------------------------------- |
| doctor-name                   | 20px | 22px | `clamp(1.25rem,1.18rem+0.19vw,1.375rem)`  |
| doctor-hero-title             | 36px | 45px | `clamp(2.25rem,1.87rem+1.69vw,2.8125rem)` |
| page-hero-title               | 36px | 56px | `clamp(2.25rem,1.68rem+2.35vw,3.5rem)`   |
| header-rating-number          | 24px | 34px | `clamp(1.5rem,1.27rem+0.94vw,2.125rem)`  |
| footer-logo                   | 20px | 32px | `clamp(1.25rem,0.99rem+1.13vw,2rem)`      |

Полный список — `nextjs/src/design-tokens/typography.ts`.

## Detailed Instructions

### Step 1: Определить min и max

- **Токен с max-md:** min = значение на mobile (Mpx), max = значение на desktop (Npx)
- **Токен фиксированный:** опционально `clamp(N*0.9, ..., N)` для лёгкого fluid

### Step 2: Рассчитать slope и preferred

```
minViewport = 375, maxViewport = 1440
slope = (maxFontSize - minFontSize) / (1440 - 375) = (max - min) / 1065
vwMultiplier = slope * 100  // для 100vw
yIntersection = minFontSize - 375 * slope
preferred = yIntersection + vwMultiplier * vw
```

### Step 3: Конвертировать в rem

16px = 1rem. Пример: 36px = 2.25rem, 48px = 3rem.

### Step 4: Добавить в typography.ts

```ts
"token-name":
  "text-[clamp(minRem,preferredRem+vwMultiplier,maxRem)] font-... leading-...",
```

## Пример расчёта (page-title)

```
minFontSize = 36px, maxFontSize = 48px
minViewport = 375px, maxViewport = 1440px

slope = (48 - 36) / (1440 - 375) = 12 / 1065 ≈ 0.01127
vwMultiplier = slope * 100 ≈ 1.13vw
yIntersection = 36 - 375 * 0.01127 ≈ 31.77px ≈ 1.99rem

clamp(36px, 31.77px + 1.13vw, 48px)
→ clamp(2.25rem, 1.99rem + 1.13vw, 3rem)
```

## Common Errors

### Ошибка: clamp не работает в Tailwind

**Причина:** Пробелы в clamp() могут ломать arbitrary value.
**Решение:** Без пробелов: `text-[clamp(1rem,0.5rem+2vw,2rem)]`

### Ошибка: Текст слишком мелкий на mobile

**Причина:** min значение слишком маленькое.
**Решение:** Увеличить min (например 14px вместо 12px для body default).

### Ошибка: Скачок на 768px остаётся

**Причина:** Где-то остался `max-md:text-[Npx]` или компонент переопределяет.
**Решение:** Убрать max-md, использовать только clamp в typography.ts.

## Best Practices

### DO

1. Использовать rem в clamp (1rem = 16px)
2. Viewport 375–1440 для всех токенов
3. Desktop = max значение (Figma = desktop)
4. Хранить все clamp в typography.ts — Single Source of Truth

### DON'T

1. Смешивать clamp с max-md в одном токене
2. Использовать px внутри clamp (prefer rem)
3. Менять viewport range для разных токенов без причины

## Источники

- [CSS-Tricks: Linearly Scale font-size with clamp](https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/)
- [web.dev: min(), max(), clamp()](https://web.dev/articles/min-max-clamp)
- [ClampGenerator](https://clampgenerator.com/) — расчёт clamp по min/max
- [responsive-adaptive.mdc](.cursor/rules/responsive-adaptive.mdc) — Fluid Typography секция
