---
name: main-page-section-header-pattern
description: Единый паттерн заголовка секции (заголовок + кнопка + навигация) для главной страницы. Use when creating or refactoring section headers with title, CTA button, and slider arrows on main page.
---

# Main Page Section Header Pattern

> Паттерн заголовка секции на главной странице — заголовок, описание, кнопка «Все X», стрелки слайдера. Desktop-First, Figma = только desktop.

## When to Use

**Используй этот skill когда:**
- Создаёшь новую секцию на главной странице с заголовком и кнопкой
- Рефакторишь header секции (Featured Reviews, Promotions, Our Works, Blog и т.д.)
- Нужен единый вид: заголовок слева, кнопка + стрелки справа на desktop
- Mobile: заголовок сверху, кнопка и стрелки снизу (column layout)

## Quick Reference

### Структура (Desktop-First)

```tsx
<div className="flex flex-row max-md:flex-col max-md:items-stretch md:items-start md:justify-between mb-12 max-md:mb-[30px] gap-6">
  <div className="flex-1">
    <Heading level={2} variant="...">Заголовок</Heading>
    <p className="text-[18px] leading-relaxed text-unident-dark">Описание</p>
  </div>
  <div className="flex flex-row max-md:flex-col max-md:items-center gap-4 w-full max-md:w-full md:w-auto">
    <Link href="/..." className="w-full max-md:w-full md:w-auto md:order-2">
      <Button unidentVariant="outline" className="w-full max-md:w-full md:min-w-[160px]">
        Все услуги
      </Button>
    </Link>
    <SliderNavigation className="max-md:self-end md:order-1 md:self-auto" />
  </div>
</div>
```

### Ключевые параметры

| Элемент | Mobile | Desktop |
|---------|--------|---------|
| Layout | `flex-col` | `flex-row` |
| Margin bottom | `mb-[30px]` | `mb-12` |
| Gap | `gap-6` | `gap-6` |
| Кнопка | `w-full` | `min-w-[160px]` |
| Order кнопки | — | `order-2` |
| Order стрелок | — | `order-1` |

## Detailed Instructions

### Step 1: Обёртка header

```tsx
<div className="flex flex-row max-md:flex-col max-md:items-stretch md:items-start md:justify-between mb-12 max-md:mb-[30px] gap-6">
```

- Desktop: row, space-between
- Mobile: column, stretch (кнопка на всю ширину)

### Step 2: Блок заголовка

```tsx
<div className="flex-1">
  <Heading level={2} variant="section-title">...</Heading>
  <p className="text-[18px]">...</p>
</div>
```

### Step 3: Блок кнопка + стрелки

```tsx
<div className="flex flex-row max-md:flex-col max-md:items-center gap-4 w-full max-md:w-full md:w-auto">
  <Link href="..." className="w-full max-md:w-full md:w-auto md:order-2">
    <Button className="w-full max-md:w-full md:min-w-[160px]">...</Button>
  </Link>
  <SliderNavigation className="max-md:self-end md:order-1 md:self-auto" />
</div>
```

- `md:order-2` — кнопка справа на desktop
- `md:order-1` — стрелки слева от кнопки на desktop
- `max-md:self-end` — стрелки прижаты вправо на mobile

### Step 4: Скрытие навигации

Если элементов ≤ 3, стрелки и dots скрывать: `{showNavigation && (...)}`

## Common Errors

### Error: Кнопка не на всю ширину на mobile

**Cause:** Забыли `w-full` на Link или Button
**Fix:** `className="w-full max-md:w-full md:w-auto"` на Link, `w-full max-md:w-full` на Button

### Error: Неправильный порядок (стрелки справа от кнопки)

**Cause:** order не задан или перепутан
**Fix:** Кнопка `md:order-2`, стрелки `md:order-1`

## References

- Rule: `.cursor/rules/responsive-adaptive.mdc`
- Skill: `.cursor/skills/responsive-adaptive-design/SKILL.md`
- Примеры: `featured-reviews-section-client.tsx`, `promotions-section-client.tsx`, `blog-section-client.tsx`
