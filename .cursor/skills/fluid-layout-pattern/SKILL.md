---
name: fluid-layout-pattern
description: Fluid layout для flex-рядов — flex-wrap, min-w-0, гибкие ширины, Figma px → %. Use when implementing header, top-bar, navigation, footer, social icons row, or any flex row that must adapt between breakpoints without horizontal scroll or overflow. Desktop-First.
---

# Fluid Layout Pattern

> Универсальный паттерн для fluid layout в любом месте (header, footer, секции). Desktop First: на 1440px ничего не меняется. Правки срабатывают только при уменьшении viewport.

## When to Use

**Используй этот skill когда:**
- Flex-ряд с несколькими элементами (header, top-bar, навигация, footer)
- Layout ломается между breakpoints (1190px, 1100px, 900px)
- Элементы обрезаются или наезжают друг на друга при уменьшении ширины
- Нужно, чтобы иконки/элементы переносились на новую строку (например, 5 иконок → 3 + 2)

## Quick Reference

### Ключевые классы

| Класс | Назначение |
|-------|------------|
| `flex-wrap` | Позволяет элементам переноситься на новую строку |
| `gap-x-4 gap-y-2` | Отступы между элементами (горизонталь + вертикаль при переносе) |
| `min-w-0` | Позволяет flex-ребёнку сжиматься (input, текст) |
| `shrink-0` | Элемент не сжимается (logo, иконки) |
| `whitespace-nowrap` | Текст не переносится (logo, label) |
| `ml-auto` | При переносе блок остаётся справа |
| `clamp(min,pref,max)` | Fluid размеры; desktop = max значение |
| `w-[52.17%]` | Проценты от контейнера 1380px (Figma px → %) |

### Запрещено

- `flex-nowrap` на контейнерах с несколькими элементами в ряд
- `overflow-hidden` на flex-контейнерах с контентом, который может обрезаться
- Фиксированная `w-[Npx]` без `min-w`/`max-w`/`flex-1`

## Detailed Instructions

### Step 1: Flex-контейнер

```tsx
// Было:
<div className="flex items-center justify-between gap-8">

// Стало:
<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
```

### Step 2: Logo / фиксированный элемент слева

```tsx
<div className="shrink-0 whitespace-nowrap">
  <Logo />
</div>
```

### Step 3: Центральный блок (nav, контент)

```tsx
<div className="flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0 flex-1">
  {/* nav items, badges, etc. */}
</div>
```

### Step 4: Правый блок (search, кнопки, соцсети)

```tsx
<div className="ml-auto shrink-0">
  <SearchBar />
</div>
```

### Step 5: Гибкая ширина вместо фиксированной

```tsx
// Было: w-[301px]
// Стало:
className="min-w-[200px] max-w-[301px] flex-1"
// или в родителе с min-w-0:
className="w-full max-w-[301px]"
```

### Step 6: clamp(), min(), max() — fluid между breakpoints

Desktop = max значение в clamp; при сужении viewport — плавное уменьшение.

```tsx
// Fluid typography
<p className="text-[clamp(1rem,2.5vw,2rem)]">...</p>

// Fluid spacing
<div className="p-[clamp(1rem,5vw,4rem)]">...</div>

// Гибкие ширины (web.dev)
<div className="w-[min(75ch,100%)]">...</div>
<div className="w-[max(45ch,50%)]">...</div>
```

### Step 7: Figma px → %

Контейнер desktop = 1380px. Формула: `(px / 1380) * 100` → `%`.

```tsx
// 720px от Figma → 52.17%
className="w-[52.17%] max-w-[720px]"

// 300px → 21.74%
className="w-[21.74%] max-w-[300px]"
```

### Step 8: Container Queries (картинка+текст)

Когда layout зависит от размера контейнера, не viewport. Desktop = широкий контейнер (1380px) → row; при сужении → column. **Header/nav — не CQ, а viewport** (`lg:`, `xl:`).

```tsx
<div className="@container">
  <div className="flex flex-col @[400px]:flex-row gap-4">
    <img className="..." />
    <div>...</div>
  </div>
</div>
```

Tailwind v3: `@[value]:`, не `@min-[value]:`. Требуется плагин `@tailwindcss/container-queries`. Skill: `.cursor/skills/container-queries-pattern/SKILL.md`

## Common Errors

### Error: Элементы всё равно обрезаются

**Cause:** `overflow-hidden` на родителе или `flex-nowrap`.

**Fix:** Убрать `overflow-hidden`, заменить `flex-nowrap` на `flex-wrap`.

### Error: На desktop layout изменился

**Cause:** Слишком агрессивные изменения (например, `flex-1` без `max-w`).

**Fix:** Desktop First — на 1440px должно быть идентично. Добавить `max-w` для ограничения ширины на desktop.

## References

- [Fractaled Mind: flex-wrap](https://fractaledmind.github.io/2024/12/12/responsive-design-tip-flex-wrap/)
- [web.dev: min(), max(), clamp()](https://web.dev/articles/min-max-clamp)
- [MDN: Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [Tailwind: Container Queries](https://tailwindcss.com/docs/responsive-design#container-queries)
- [cursor.directory: Rules for Responsive Design](https://cursor.directory/rules/responsive-design)
- [cursor.directory: UI/UX Design Best Practices](https://cursor.directory/ui-ux-design-best-practices)
- [cursor.directory: HTML and CSS Best Practices](https://cursor.directory/html-and-css-best-practices)
