---
name: responsive-global-patterns
description: Глобальные паттерны адаптации приложений для tablet и mobile. Use when implementing responsive design, choosing mobile-first vs desktop-first, or applying industry best practices for breakpoints and touch targets.
---

# Responsive Global Patterns

> Общие паттерны адаптации веб-приложений под tablet и mobile. Не специфично для УниДент — применимо к любому проекту.

**УниДент:** использует **Desktop-First** (Figma = только desktop 1380px). Базовые стили = desktop; модификаторы `max-*:` для меньших экранов.

## When to Use

**Используй этот skill когда:**
- Выбираешь подход: Responsive vs Adaptive, Mobile-First vs Desktop-First
- Нужны стандартные breakpoints и touch targets
- Ищешь best practices по responsive design
- Настраиваешь правила адаптации для нового проекта

## Quick Reference

### Responsive vs Adaptive

| Критерий | Responsive | Adaptive |
|----------|------------|----------|
| Layout | Fluid, плавно меняется | Фиксированные layouts по breakpoints |
| Код | Один layout для всех | Несколько layouts |
| Поддержка | Проще | Сложнее |
| Рекомендация 2024 | Стандарт для большинства | Только для специфичных устройств |

### Layout по viewport vs контейнеру

| Подход | Когда использовать | Пример |
|--------|--------------------|--------|
| Viewport (media) | Header, nav, footer — layout зависит от экрана | `lg:grid xl:flex`, `grid-cols-[1fr_auto_1fr]` |
| Container Queries | Картинка+текст, карточки в sidebar — layout по контейнеру | `@[400px]:flex-row` (v3: `@[value]:`) |

### Mobile-First vs Desktop-First

| Подход | Базовые стили | Модификаторы | Когда использовать |
|--------|---------------|--------------|---------------------|
| Mobile-First | Mobile | `md:`, `lg:` для больших экранов | Figma есть для mobile и desktop |
| Desktop-First | Desktop | `max-md:`, `max-lg:` для меньших | Figma только desktop, адаптируем вниз |

### Breakpoints (Tailwind)

| Prefix | Min-width | Устройства |
|--------|-----------|------------|
| (base) | 0 | Mobile |
| sm | 640px | Телефоны горизонтально |
| md | 768px | iPad Mini, планшеты |
| lg | 1024px | iPad Pro, desktop |
| xl | 1280px | Desktop |
| 2xl | 1536px | Большой desktop |

Desktop-First: `max-xl:`, `max-lg:`, `max-md:`, `max-sm:`.

### Touch Targets

- Минимум **44×44px** для интерактивных элементов на mobile (WCAG, Apple HIG)
- `min-h-[44px] min-w-[44px]` или `p-3` (12px padding)
- Расстояние между targets — минимум 8px

## Detailed Instructions

### Паттерны layout

**Grid:**
```tsx
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
// или Desktop-First:
grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1
```

**Flex:**
```tsx
flex-col md:flex-row
// или Desktop-First:
flex-row max-md:flex-col
```

**Padding секций:**
```tsx
p-[15px] md:p-12
// mobile 15px, tablet+ 48px
```

### Скрытие по breakpoint

```tsx
hidden md:block   // только desktop
block md:hidden   // только mobile
// Desktop-First:
hidden max-md:block   // только mobile
block max-md:hidden   // только desktop
```

### Тестирование

Проверять на размерах: **375px**, **768px**, **1024px**, **1280px** (Chrome DevTools Responsive Mode).

## Fluid Layout между breakpoints

Layout ломается между breakpoints (1440→1024, 1024→768). Паттерны:

- **flex-wrap** по умолчанию для flex-контейнеров с несколькими элементами в ряд
- **min-w-0** для flex-детей, которые должны сжиматься (input, текст)
- **clamp()** / **min()** / **max()** для гибких размеров; desktop = max значение
- **shrink-0** только для logo/иконок; остальное — позволять shrink
- **overflow-hidden** запрещён на flex-контейнерах с контентом, который может обрезаться

**Паттерн flex-ряда:**
```tsx
<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
  <div className="shrink-0 whitespace-nowrap">Logo</div>
  <div className="flex flex-wrap gap-2 min-w-0 flex-1">...</div>
  <div className="ml-auto shrink-0">...</div>
</div>
```

**clamp() — desktop получает max значение:**
```tsx
// Fluid typography
<p className="text-[clamp(1rem,2.5vw,2rem)]">...</p>

// Fluid spacing
<div className="p-[clamp(1rem,5vw,4rem)]">...</div>

// Гибкие ширины (web.dev)
<div className="w-[min(75ch,100%)]">...</div>
```

**Ссылки:** [Fractaled Mind: flex-wrap](https://fractaledmind.github.io/2024/12/12/responsive-design-tip-flex-wrap/), [web.dev: min/max/clamp](https://web.dev/articles/min-max-clamp), [cursor.directory responsive-design](https://cursor.directory/rules/responsive-design). Skill: `.cursor/skills/fluid-layout-pattern/SKILL.md`

## Best Practices

### DO

1. Использовать fluid grids и flexible images
2. Задавать width/height для next/image (CLS)
3. Touch targets ≥ 44px на mobile
4. Проверять на реальных устройствах или DevTools
5. Единый подход (Mobile-First или Desktop-First) в проекте

### DON'T

1. Фиксированные ширины без responsive-fallback
2. overflow-x: auto без явной необходимости (карусели — исключение)
3. Смешивать Mobile-First и Desktop-First в одном компоненте без причины
4. Игнорировать breakpoints при добавлении компонентов

## References

- [Tailwind: Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Tailwind: Container Queries](https://tailwindcss.com/docs/responsive-design#container-queries)
- [web.dev: min(), max(), clamp()](https://web.dev/articles/min-max-clamp)
- [MDN: Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- WCAG 2.1: Touch target size
- [cursor.directory: Rules for Responsive Design](https://cursor.directory/rules/responsive-design)
- [cursor.directory: UI/UX Design Best Practices](https://cursor.directory/ui-ux-design-best-practices)
