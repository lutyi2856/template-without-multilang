---
name: container-queries-pattern
description: Container Queries для layout по размеру контейнера. Use when picture+text block, cards in sidebar, or layout depends on container width not viewport (e.g. 769px tablet with narrow container). Desktop-First, Tailwind @tailwindcss/container-queries.
---

# Container Queries Pattern

> Layout по размеру контейнера, а не viewport. Desktop-First: на desktop контейнер полной ширины (1380px) → row; при сужении viewport контейнер сужается → column.

## Viewport vs Container — когда что использовать

| Сценарий | Инструмент | Пример |
|----------|------------|--------|
| Page-level layout (header, nav, footer) | **Viewport breakpoints** `lg:`, `xl:` | Header: `lg:grid xl:flex`, `grid-cols-[1fr_auto_1fr]` при 1024px, `xl:flex xl:justify-between` при 1280px |
| Компонент в разном контексте (sidebar vs main) | **Container Queries** | Картинка+текст: row при контейнере ≥400px, column при уже |
| Элементы в ряд с переносом | **Viewport + flex-wrap** | Header top-bar: `flex flex-wrap`, `lg:`, `xl:` |

**Важно:** Header, navigation, footer — всегда viewport (`lg:`, `xl:`). CQ не подходит: хедер на всю ширину, его layout зависит от viewport, не от контейнера.

## When to Use

**Используй этот skill когда:**
- Картинка + текст: layout зависит от доступного места (769px viewport — ещё tablet, но контейнер узкий)
- Карточки в grid/sidebar — один и тот же компонент в разной ширине
- Media queries не подходят — viewport tablet, но контейнер узкий (картинка 300px + текст → row; картинка 100px → column)

**НЕ используй CQ когда:**
- Header, navigation, footer — используй `lg:`, `xl:`, `max-lg:` и т.д.
- Layout зависит от ширины экрана, а не от ширины родительского блока

## Quick Reference

### Tailwind v3 + плагин @tailwindcss/container-queries

| Класс | Назначение |
|-------|------------|
| `@container` | Родитель — контекст для Container Query |
| `@[400px]:flex-row` | Row при ширине контейнера ≥ 400px (v3 arbitrary) |
| `@lg:flex-row` | Row при контейнере ≥ 32rem (предустановка) |

**Синтаксис v3:** arbitrary values — `@[400px]:`. Официальный Tailwind v3.2 blog: `@[618px]:flex`. Tailwind v4 (встроенный) использует `@min-[400px]:`. Если `@min-[Npx]:` не срабатывает в v3 — заменить на `@[Npx]:`.

### Desktop-First

- На desktop контейнер широкий (1380px) → `@[400px]:flex-row` срабатывает → row
- При сужении viewport контейнер сужается → column

## Detailed Instructions

### Step 1: Установка плагина (Tailwind v3)

```bash
npm install @tailwindcss/container-queries
```

```js
// tailwind.config.js
module.exports = {
  plugins: [require('@tailwindcss/container-queries'), ...],
}
```

### Step 2: Разметка контейнера

```tsx
<div className="@container">
  {/* Дети реагируют на ширину этого контейнера */}
</div>
```

### Step 3: Паттерн картинка + текст

```tsx
<div className="@container">
  <div className="flex flex-col @[400px]:flex-row gap-4">
    <img className="w-full @[400px]:w-[300px] @[400px]:shrink-0" src="..." />
    <div className="min-w-0 flex-1">...</div>
  </div>
</div>
```

- Base = `flex-col` (узкий контейнер)
- `@[400px]:flex-row` — при широком контейнере (desktop) row (v3: `@[value]:`)

### Step 4: Произвольные размеры (v3)

```tsx
<div className="@[475px]:flex-row">  // 475px — v3 arbitrary
<div className="@lg:flex-row">       // 32rem — предустановка
```

## Common Errors

### Error: Container Queries не работают

**Cause:** Плагин не установлен или не добавлен в tailwind.config.js.

**Fix:** `npm install @tailwindcss/container-queries` и добавить в plugins.

### Error: CQ-классы не применяются (@min-[Npx]: не срабатывает)

**Cause:** Tailwind v3 плагин использует `@[value]:` для arbitrary, не `@min-[value]:`. Синтаксис `@min-[Npx]:` — из Tailwind v4 (встроенный).

**Fix:** Заменить `@min-[400px]:flex-row` на `@[400px]:flex-row`.

### Error: На desktop всё равно column

**Cause:** Контейнер не получает ширину (родитель с `overflow-hidden` или `width: 0`).

**Fix:** Убедиться, что контейнер имеет явную ширину или наследует от родителя.

### Error: Контейнер схлопывается (0 width) во flex

**Cause:** `@container` на flex-ребёнке без явного размера. `container-type: inline-size` включает containment — элемент не может взять размер от контента.

**Fix:** `@container` ставить на родителя с явной шириной (`min-w-[Npx]`, `w-[Npx]`) ИЛИ дать самому контейнеру явный размер.

### Error: Слишком рано переключается в column

**Cause:** Порог `@[400px]` слишком высокий для контента.

**Fix:** Уменьшить порог: `@[300px]:flex-row` или подобрать по контенту.

## Best Practices

### DO

1. Использовать для картинка+текст, карточки в sidebar
2. Base = узкий layout (column); `@[Npx]:` для широкого (row) — v3 синтаксис
3. Подбирать порог по минимальной ширине для row (например 400px для картинки 300px + gap + текст)
4. Для header/nav/footer — viewport breakpoints (`lg:`, `xl:`), не CQ

### DON'T

1. Использовать CQ для page-level layout (header, nav, footer) — там `lg:`, `xl:`
2. Использовать `@min-[Npx]:` в Tailwind v3 — плагин ожидает `@[Npx]:`
3. Смешивать без причины CQ и media queries в одном компоненте
4. Забывать про `@container` на родителе

## Case Study: Header (viewport, не CQ)

Header — full-width, layout зависит от viewport. CQ (`@min-[900px]:`, `@min-[1200px]:`) не подходят: плагин v3 не поддерживает `@min-[value]:`, и по смыслу это viewport. Решение: `lg:grid grid-cols-[1fr_auto_1fr]` (2 ряда), `xl:flex xl:justify-between` (1 ряд, равномерно).

## References

- [MDN: Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [Tailwind v3.2: Container Queries](https://tailwindcss.com/blog/tailwindcss-v3-2) — синтаксис `@[value]:`
- [web.dev: Container Queries](https://web.dev/learn/css/container-queries)
- Rule: `.cursor/rules/responsive-adaptive.mdc`
- Skill: `.cursor/skills/fluid-layout-pattern/SKILL.md`
