---
name: main-page-adaptation-audit
description: Чеклист и ретроспектива адаптации главной страницы УниДент. Use when auditing main page responsive behavior, documenting adaptation patterns, or fixing layout issues on mobile/tablet.
---

# Main Page Adaptation Audit

> Ретроспектива адаптации главной страницы. Figma = только desktop. Mobile/tablet адаптированы «на глаз». Desktop-First подход.

## When to Use

**Используй этот skill когда:**
- Аудит адаптивности главной страницы
- Фиксация паттернов и отступов от Figma
- Исправление layout-проблем на mobile/tablet
- Добавление новой секции на главную

## Секции главной страницы и паттерны

| Секция | Компонент | Паттерны |
|--------|-----------|----------|
| Hero | HeroSection | `flex-col lg:flex-row`, скрытие блоков `lg:hidden` / `hidden lg:flex`, типографика `text-[36px] lg:text-[50px]` |
| Stats | StatsBlock | — |
| Advantages | AdvantagesSection | Grid `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`, padding `p-[15px] md:px-12 md:py-16` |
| Services | ServicesSection | Header `flex-col md:flex-row`, grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, padding `p-[15px] md:px-12 md:py-12` |
| Featured Reviews | FeaturedReviewsSectionClient | Section header pattern, slider 1 card (`flex-[0_0_100%]`) |
| Our Works | OurWorksSectionClient | Section header pattern, multi-card slider (2 per slide) |
| Price | PriceSection | Grid `grid-cols-1 lg:grid-cols-[2fr_1fr]` |
| Doctors | DoctorsSection | — |
| CTA | CtaSection | `flex-col lg:flex-row`, скрытие изображения `lg:hidden` / `hidden lg:flex` |
| Quote | QuoteSection | `flex-col lg:flex-row`, `max-md:text-[16px]`, `hidden md:flex` / `flex flex-col gap-4 md:hidden` |
| Promotions | PromotionsSectionClient | Section header pattern, slider 1/2/3 cards per viewport |
| Reviews | ReviewsSectionClient | Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| Blog | BlogSectionClient | Section header pattern, slider 1/2/3 cards per viewport |
| Licenses | LicensesSectionClient | Section header pattern, carousel widths `w-[288px] md:w-[596px] lg:w-[1212px]` |
| Clinics on Map | ClinicsOnMapSectionClient | `max-md:order-0` / `max-md:order-1`, `max-md:-mx-5`, `md:absolute` overlay, useMediaQuery |

## Единые параметры

### Section padding (внутренний блок с фоном)

```
p-[15px] md:p-12
// или
p-[15px] md:px-12 md:py-12
```

### Section header margin

```
mb-[30px] md:mb-12
```

### Кнопки в header

```
w-full md:w-auto min-w-[160px]
// или
w-full md:min-w-[160px]
```

### Grid gap

```
gap-6
// mobile иногда меньше:
gap-6 max-md:gap-4
```

## Типичные ошибки и исправления

### Overflow на mobile

**Причина:** Фиксированная ширина без `max-w-full` или `w-full`
**Исправление:** `w-[380px] lg:w-[387px] max-w-full`

### Карточка выходит за экран

**Причина:** `flex-[0_0_100%]` без `min-w-0`
**Исправление:** Добавить `min-w-0` на wrapper

### Неправильный order кнопки и стрелок

**Причина:** order не задан
**Исправление:** Кнопка `md:order-2`, стрелки `md:order-1`

### Контейнер с горизонтальным скроллом

**Причина:** `max-md:-mx-5` без `max-md:w-[calc(100%+2.5rem)]`
**Исправление:** Добавить `max-md:w-[calc(100%+2.5rem)]` для edge-to-edge

## Чеклист аудита

- [ ] Нет горизонтального скролла на 375px, 768px
- [ ] Touch targets ≥ 44px
- [ ] Section headers единообразны
- [ ] Padding секций: 15px mobile, 48px desktop
- [ ] Slider показывает 1/2/3 карточки по breakpoint
- [ ] Кнопки на всю ширину на mobile
- [ ] Скрытие/показ по breakpoint работает

## References

- Rule: `.cursor/rules/responsive-adaptive.mdc`
- Skill: `.cursor/skills/responsive-adaptive-design/SKILL.md`
- Skill: `.cursor/skills/main-page-section-header-pattern/SKILL.md`
- Skill: `.cursor/skills/responsive-slider-cards-per-viewport/SKILL.md`
