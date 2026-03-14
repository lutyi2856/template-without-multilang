---
name: responsive-slider-cards-per-viewport
description: Embla Carousel слайдер с 1/2/3 карточками в зависимости от viewport. Use when implementing sliders that show different number of cards per view (1 mobile, 2 tablet, 3 desktop).
---

# Responsive Slider — Cards Per Viewport

> Слайдер (Embla Carousel), где количество видимых карточек зависит от breakpoint: 1 на mobile, 2 на tablet, 3 на desktop. CSS-driven, без JS resize listener.

## When to Use

**Используй этот skill когда:**
- Нужен слайдер с responsive количеством карточек (Promotions, Blog, Our Works)
- Каждая карточка — отдельный слайд, ширина через flex
- Не группировать карточки в «слайды» (в отличие от multi-card-slider-pattern)

## Quick Reference

### Flex-классы для карточки

| Breakpoint | Карточек видно | Класс |
|------------|----------------|-------|
| Mobile | 1 | `flex-[0_0_100%]` |
| Tablet (md) | 2 | `flex-[0_0_calc((100%-10px)/2)]` |
| Desktop (lg) | 3 | `flex-[0_0_calc((100%-20px)/3)]` |

Gap между карточками: 10px (`gap-[10px]`).

### Полный пример

```tsx
<div className="overflow-hidden" ref={emblaRef}>
  <div className="flex gap-[10px]">
    {items.map((item) => (
      <div
        key={item.id}
        className="min-w-0 flex flex-col flex-[0_0_100%] md:flex-[0_0_calc((100%-10px)/2)] lg:flex-[0_0_calc((100%-20px)/3)]"
      >
        <Card item={item} />
      </div>
    ))}
  </div>
</div>
```

## Detailed Instructions

### Step 1: Embla setup

```tsx
const [emblaRef, emblaApi] = useEmblaCarousel({
  loop: true,
  align: 'start',
  slidesToScroll: 1,
});
```

### Step 2: Контейнер flex с gap

```tsx
<div className="flex gap-[10px]">
```

Gap 10px — учитывать в calc для ширины карточки.

### Step 3: Ширина карточки по breakpoint

- **Mobile:** `flex-[0_0_100%]` — одна карточка на весь viewport
- **Tablet (md):** `flex-[0_0_calc((100%-10px)/2)]` — две карточки, один gap между ними
- **Desktop (lg):** `flex-[0_0_calc((100%-20px)/3)]` — три карточки, два gap (10px × 2)

### Step 4: min-w-0

Обязательно `min-w-0` на карточке, иначе flex-shrink не сработает и будет overflow.

## Common Errors

### Error: Горизонтальный скролл на mobile

**Cause:** Забыли `min-w-0` или `flex-[0_0_100%]` не применяется
**Fix:** Добавить `min-w-0` на wrapper карточки

### Error: Карточки сжимаются неправильно

**Cause:** Неверный calc (не учтён gap)
**Fix:** Для N карточек: `calc((100% - (N-1) * 10px) / N)` при gap 10px

### Error: Всегда 1 карточка на всех экранах

**Cause:** Использовали только `flex-[0_0_100%]` без md:/lg: модификаторов
**Fix:** Добавить `md:flex-[0_0_calc((100%-10px)/2)] lg:flex-[0_0_calc((100%-20px)/3)]`

## References

- Skill: `.cursor/skills/multi-card-slider-pattern/SKILL.md` (другой паттерн — группировка в слайды)
- Примеры: `promotions-section-client.tsx`, `blog-section-client.tsx`
- Rule: `.cursor/rules/responsive-adaptive.mdc`
