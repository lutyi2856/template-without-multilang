---
name: responsive-adaptive-design
description: Desktop-first адаптация компонентов под планшет и мобильные. Use when adapting components for responsive layout, fixing overflow on small screens, or implementing breakpoint-specific styles.
---

# Responsive Adaptive Design - УниДент

> Пошаговый процесс адаптации компонента под планшет и мобильные устройства. Desktop-first подход. **Контекст:** Figma = только desktop; mobile/tablet адаптируются «на глаз».

## When to Use

**Используй этот skill когда:**
- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
- Адаптируешь компонент под мобильные/планшет
- Видишь фиксированные ширины `w-[330px]`, `w-[280px]` без responsive
- Компонент ломается или overflow на узких экранах
- Добавляешь новый компонент и нужно сразу сделать его адаптивным
- Проверяешь адаптивность страницы

## Quick Reference

### Desktop-First с Tailwind

```tsx
// Базовые стили = desktop. Override для меньших экранов через max-*:
<div className="flex flex-row max-md:flex-col gap-6 max-md:gap-4">
<div className="w-[330px] max-md:w-full">
<div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
```

### Breakpoints

| Prefix | Viewport |
|--------|----------|
| max-xl: | < 1280px |
| max-lg: | < 1024px |
| max-md: | < 768px |
| max-sm: | < 640px |
| max-xs: | < 375px |

## Detailed Instructions

### Step 1: Аудит компонента

1. Открыть файл компонента
2. Найти фиксированные размеры: `w-[Npx]`, `h-[Npx]`, `min-w-[Npx]`, `max-w-[Npx]`
3. Проверить наличие responsive-классов: `sm:`, `md:`, `lg:`, `max-md:`, `max-lg:`
4. Найти flex/grid без responsive модификаторов
5. Проверить padding/margin — могут вызывать overflow на мобильных

### Step 2: Определить поведение на breakpoints

Для каждого breakpoint решить:
- **Layout:** flex-col на mobile, flex-row на desktop? Grid 1/2/3 колонки?
- **Ширина:** w-full на mobile, фиксированная на desktop?
- **Скрытие:** что скрыть на mobile (hidden max-md:block / block max-md:hidden)?
- **Typography:** уменьшить font-size?
- **Spacing:** уменьшить gap, padding?

### Step 3: Применить изменения

1. **Фиксированные ширины** → `w-full max-md:w-full lg:w-[330px]` или `w-full max-w-[330px]`
2. **Grid** → `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
3. **Flex** → `flex-col md:flex-row` или `flex-row max-md:flex-col`
4. **Typography** → `text-2xl max-md:text-xl max-sm:text-lg`
5. **Spacing** → `gap-6 max-md:gap-4 max-sm:gap-3`
6. **Images** → `w-full` + `object-cover`

### Step 4: Проверить на размерах

Chrome DevTools → Toggle device toolbar → проверить:
- **375px** — iPhone SE
- **768px** — iPad portrait
- **1024px** — iPad landscape
- **1280px** — Desktop (должно совпадать с текущей версией)

### Step 5: Чеклист

- [ ] Нет горизонтального скролла (overflow-x)
- [ ] Touch targets ≥ 44x44px на мобильных
- [ ] Текст читаемый (не слишком мелкий)
- [ ] Изображения масштабируются
- [ ] Кнопки и ссылки кликабельны
- [ ] Формы работают (поля не обрезаны)

## Common Patterns

### Карточка в grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-md:gap-4">
  {items.map(item => (
    <Card key={item.id} className="w-full max-w-[330px] mx-auto lg:mx-0 lg:max-w-none">
      {content}
    </Card>
  ))}
</div>
```

### Footer колонки

```tsx
<div className="flex flex-col md:flex-row gap-8 max-md:gap-6">
  <div className="w-full md:w-[217px]">...</div>
  <div className="w-full md:w-[208px]">...</div>
</div>
```

### Скрытие/показ по breakpoint

```tsx
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

## Common Errors

### Error: Компонент выходит за границы на мобильных

**Cause:** Фиксированная ширина без max-width или overflow
**Fix:** Добавить `w-full max-md:w-full` или `overflow-x-hidden` на родителе

### Error: Слишком мелкий текст на мобильных

**Cause:** Одинаковый font-size на всех экранах
**Fix:** `text-base max-md:text-sm` или через Design System responsive variant

### Error: Кнопки слишком маленькие для touch

**Cause:** padding < 12px или min-height < 44px
**Fix:** `min-h-[44px] min-w-[44px] px-4 py-3`

## Related Skills

- **Archive Filters Mobile UI:** `.cursor/skills/archive-filters-mobile-ui/SKILL.md` — фильтры архивных страниц: desktop чипы, mobile Sheet
- **Section Header Pattern:** `.cursor/skills/main-page-section-header-pattern/SKILL.md` — единый паттерн заголовка секции (заголовок + кнопка + стрелки)
- **Responsive Slider:** `.cursor/skills/responsive-slider-cards-per-viewport/SKILL.md` — слайдер с 1/2/3 карточками по viewport
- **Main Page Audit:** `.cursor/skills/main-page-adaptation-audit/SKILL.md` — чеклист и ретроспектива главной страницы
- **Global Patterns:** `.cursor/skills/responsive-global-patterns/SKILL.md` — общие паттерны responsive/adaptive

## References

- Rule: `.cursor/rules/responsive-adaptive.mdc`
- Tailwind responsive: https://tailwindcss.com/docs/responsive-design
- Breakpoints config: `nextjs/tailwind.config.ts`
