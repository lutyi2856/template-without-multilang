---
name: design-system-usage
description: Working with УниДент Design System - Design Tokens, universal components, and preset styles. Use when creating new components, refactoring existing ones, or implementing designs from Figma.
---

# Design System Usage - УниДент

> Skill для работы с современной дизайн-системой на основе Design Tokens подхода

## When to Use

**Используй этот skill когда:**
- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
- Создаешь новый UI компонент
- Рефакторишь существующий компонент под дизайн-систему
- Реализуешь дизайн из Figma
- Видишь хардкод цветов `bg-[#526AC2]` или типографики `text-[22px]`
- Нужно добавить новый вариант типографики
- Работаешь с текстом, заголовками, кнопками, карточками, бейджами

## Quick Reference

### Импорты

```typescript
// Typography (универсальные компоненты)
import { Text, Heading } from '@/components/design-system';

// Basics (preset компоненты)
import { Button, Card, Badge } from '@/components/design-system';

// Layout (контейнеры)
import { Container, Section } from '@/components/design-system';

// Design Tokens (для создания новых компонентов)
import { typography } from '@/design-tokens/typography';
```

### Базовое использование

```tsx
// Text - для всего текста
<Text variant="default">Обычный текст</Text>
<Text variant="doctor-description">Описание врача</Text>
<Text variant="clinic-name" as="span">Название клиники</Text>

// Heading - для всех заголовков
<Heading level={1}>Заголовок страницы</Heading>
<Heading level={3} variant="card-title">Заголовок карточки</Heading>

// Button - кнопки с preset стилями
<Button unidentVariant="primary">Записаться</Button>
<Button unidentVariant="outline">Отменить</Button>

// Card - карточки
<Card variant="bordered">Содержимое</Card>

// Badge - бейджи (рейтинг, стаж)
<Badge variant="rating">4.7 ★</Badge>
<Badge variant="experience">36 лет</Badge>
```

---

## Design Tokens Philosophy

### Принципы

1. **Все через переменные** - цвета и типографика только через Design Tokens
2. **Универсальные компоненты** - Text/Heading вместо множества специфичных
3. **Design Tokens подход** - Single Source of Truth для всех стилей
4. **Consistency первее гибкости** - готовые варианты вместо custom стилей
5. **Performance-first** - Server Components по умолчанию

### Структура

```
nextjs/src/
  design-tokens/
    typography.ts           # Single Source of Truth для типографики
  components/
    design-system/
      text.tsx             # Универсальный Text компонент
      heading.tsx          # Универсальный Heading компонент
      button.tsx           # Button с preset стилями
      card.tsx             # Card с preset стилями
      badge.tsx            # Badge для рейтингов
      container.tsx        # Layout контейнер
      section.tsx          # Layout секция
```

---

## Step-by-Step Guide

### Шаг 1: Создание нового компонента

**Вместо хардкода:**

```tsx
// ❌ ПЛОХО - хардкод
export function DoctorCard({ name, description }: Props) {
  return (
    <div className="bg-white border-2 border-[#D8D8D8] rounded-[25px] p-6">
      <h3 className="text-[22px] font-semibold text-[#191E35]">
        {name}
      </h3>
      <p className="text-[16px] text-[#191E35]">
        {description}
      </p>
    </div>
  );
}
```

**Используй Design System:**

```tsx
// ✅ ХОРОШО - через Design System
import { Card, Heading, Text } from '@/components/design-system';

export function DoctorCard({ name, description }: Props) {
  return (
    <Card variant="bordered">
      <Heading level={3} variant="card-title">
        {name}
      </Heading>
      <Text variant="doctor-description">
        {description}
      </Text>
    </Card>
  );
}
```

### Шаг 2: Рефакторинг существующего компонента

**Checklist:**

1. ✅ Заменить `<h1-h6>` на `<Heading level={...} variant="...">`
2. ✅ Заменить `<p>`, `<span>`, `<div>` с текстом на `<Text variant="...">`
3. ✅ Заменить хардкод цветов `bg-[#...]` на `bg-unident-*`
4. ✅ Заменить хардкод типографики `text-[22px]` на Design Tokens
5. ✅ Обернуть в `<Card variant="...">` если это карточка
6. ✅ Использовать `<Button unidentVariant="...">` для кнопок
7. ✅ Использовать `<Badge variant="...">` для меток

**Пример рефакторинга:**

```tsx
// ❌ БЫЛО
<div className="bg-white border border-[#D8D8D8] rounded-[25px]">
  <h3 className="text-[22px] font-semibold">
    Иванов Иван Иванович
  </h3>
  <p className="text-[16px]">
    Стоматолог-терапевт
  </p>
  <button className="bg-[#526AC2] text-white px-6 py-3">
    Записаться
  </button>
</div>

// ✅ СТАЛО
<Card variant="bordered">
  <Heading level={3} variant="card-title">
    Иванов Иван Иванович
  </Heading>
  <Text variant="doctor-description">
    Стоматолог-терапевт
  </Text>
  <Button unidentVariant="primary">
    Записаться
  </Button>
</Card>
```

### Шаг 3: Добавление нового варианта типографики

**Если нужен новый стиль из Figma:**

1. Открой `nextjs/src/design-tokens/typography.ts`
2. Добавь новый токен в соответствующую категорию (`body`, `heading`, `figma`)
3. Используй в компонентах

**Пример:**

```typescript
// 1. Добавить в design-tokens/typography.ts
export const typography = {
  figma: {
    'doctor-name': 'text-[22px] font-semibold leading-[1.19]',
    'service-title': 'text-[20px] font-medium leading-[1.2]', // НОВЫЙ
  }
} as const;

// 2. Использовать
<Text variant="service-title">Название услуги</Text>
```

### Шаг 4: Работа с цветами

**Используй только `unident-*` цвета:**

```tsx
// ❌ ПЛОХО - хардкод
<div className="bg-[#526AC2] text-[#191E35] border-[#D8D8D8]">

// ✅ ХОРОШО - через Design Tokens
<div className="bg-unident-primary text-unident-dark border-unident-borderGray">
```

**Доступные цвета:**

```typescript
// Основные
bg-unident-primary       // #526AC2 - основной синий
bg-unident-white         // #FFFFFF - белый
bg-unident-dark          // #191E35 - темный текст

// Фоны
bg-unident-bgTopbar      // #F9F9F9 - топбар
bg-unident-bgElements    // #F5F7F9 - элементы
bg-unident-bgLightGray   // #EEF3F9 - светло-серый фон
bg-unident-bgLightBlue   // #D9E4F7 - светло-синий фон

// Границы и текст
border-unident-borderGray  // #D8D8D8 - границы
text-unident-textGray      // #8F8F8F - вторичный текст
```

---

## Typography Design Tokens

### Body варианты (базовый текст)

```typescript
variant="default"  // 16px, font-normal - обычный текст
variant="large"    // 18px, font-normal - крупный текст
variant="small"    // 14px, font-normal - маленький текст
variant="xs"       // 12px, font-normal - очень маленький текст
```

### Heading варианты (заголовки)

```typescript
variant="page-title"     // 48px, font-bold - H1
variant="section-title"  // 32px, font-bold - H2
variant="card-title"     // 22px, font-semibold - H3
variant="subsection"     // 20px, font-semibold - H4
```

### Figma варианты (специфичные для дизайна)

```typescript
// Doctor Card
variant="doctor-name"         // 22px, font-semibold
variant="doctor-description"  // 16px, font-normal
variant="clinic-name"         // 16px, font-medium

// Badges
variant="experience-number"   // 19px, font-medium
variant="experience-label"    // 8px, font-medium, uppercase
variant="rating-number"       // 17px, font-medium
variant="rating-source"       // 8.5px, font-medium

// UI элементы
variant="button-text"         // 16px, font-semibold
variant="nav-link"            // 16px, font-medium
variant="label"               // 14px, font-medium
```

---

## Component Reference

### Text Component

**Props:**
- `variant` - стиль из Design Tokens (обязательно)
- `as` - HTML тег: `p`, `span`, `div`, `label` (default: `p`)
- `className` - дополнительные Tailwind классы

**Примеры:**

```tsx
// Базовое
<Text>Обычный текст</Text>

// С вариантом
<Text variant="doctor-description">Описание врача</Text>

// С другим HTML тегом
<Text variant="clinic-name" as="span">Клиника</Text>

// С дополнительными стилями
<Text variant="default" className="mb-4 text-unident-textGray">
  Вторичный текст с отступом
</Text>
```

### Heading Component

**Props:**
- `level` - уровень заголовка: `1`, `2`, `3`, `4`, `5`, `6` (обязательно)
- `variant` - стиль из Design Tokens (опционально, по умолчанию зависит от level)
- `className` - дополнительные Tailwind классы

**Примеры:**

```tsx
// Базовое (автоматический variant по level)
<Heading level={1}>Заголовок страницы</Heading>

// С явным variant
<Heading level={3} variant="card-title">
  Заголовок карточки врача
</Heading>

// С дополнительными стилями
<Heading level={1} variant="page-title" className="mb-8 text-center">
  Главный заголовок
</Heading>
```

### Button Component

**Props:**
- `unidentVariant` - preset стиль: `primary`, `secondary`, `outline`
- Все props от shadcn/ui Button

**Примеры:**

```tsx
// Основная кнопка
<Button unidentVariant="primary">
  Записаться на прием
</Button>

// Вторичная кнопка
<Button unidentVariant="secondary">
  Подробнее
</Button>

// Outline кнопка
<Button unidentVariant="outline">
  Отменить
</Button>

// С дополнительными стилями
<Button unidentVariant="primary" className="w-full">
  Записаться онлайн
</Button>
```

### Card Component

**Props:**
- `variant` - стиль карточки: `default`, `bordered`, `elevated`

**Примеры:**

```tsx
// Карточка с границей (default)
<Card variant="bordered">
  <Heading level={3}>Заголовок</Heading>
  <Text>Содержимое</Text>
</Card>

// Карточка с тенью
<Card variant="elevated">
  Содержимое с тенью
</Card>

// С дополнительными стилями
<Card variant="bordered" className="hover:shadow-lg transition-shadow">
  Интерактивная карточка
</Card>
```

### Badge Component

**Props:**
- `variant` - стиль бейджа: `rating`, `experience`, `default`

**Примеры:**

```tsx
// Бейдж рейтинга (голубой фон)
<Badge variant="rating">
  4.7 ★
</Badge>

// Бейдж стажа (серый фон)
<Badge variant="experience">
  36 лет
</Badge>

// Default бейдж (синий фон)
<Badge variant="default">
  Новинка
</Badge>
```

---

## Common Errors

### Error 1: Хардкод цветов

**❌ Проблема:**
```tsx
<div className="bg-[#526AC2] text-[#191E35]">
```

**✅ Решение:**
```tsx
<div className="bg-unident-primary text-unident-dark">
```

### Error 2: Хардкод типографики

**❌ Проблема:**
```tsx
<p className="text-[16px] font-normal leading-[1.25]">
  Описание
</p>
```

**✅ Решение:**
```tsx
<Text variant="doctor-description">
  Описание
</Text>
```

### Error 3: Создание специфичных компонентов

**❌ Проблема:**
```tsx
// НЕ создавать
function DoctorNameText({ children }: Props) {
  return <h3 className="text-[22px] font-semibold">{children}</h3>;
}

function PrimaryButton({ children }: Props) {
  return <button className="bg-[#526AC2]">{children}</button>;
}
```

**✅ Решение:**
```tsx
// Использовать универсальные компоненты
<Heading level={3} variant="card-title">{name}</Heading>
<Button unidentVariant="primary">Текст кнопки</Button>
```

### Error 4: Неправильный HTML тег для текста

**❌ Проблема:**
```tsx
// Используется <p> внутри inline элемента
<span>
  <Text>Текст</Text> {/* по умолчанию <p> - блочный элемент! */}
</span>
```

**✅ Решение:**
```tsx
// Указать правильный тег через prop "as"
<span>
  <Text as="span">Текст</Text>
</span>
```

### Error 5: Забыли указать variant

**❌ Проблема:**
```tsx
// Используется default вариант вместо семантического
<Text>{doctorDescription}</Text>
```

**✅ Решение:**
```tsx
// Указать правильный семантический вариант
<Text variant="doctor-description">{doctorDescription}</Text>
```

---

## Best Practices

### ✅ DO:

1. **Всегда используй семантические варианты**
   ```tsx
   <Text variant="doctor-description">...</Text>
   ```

2. **Используй правильный HTML тег через `as` prop**
   ```tsx
   <Text variant="clinic-name" as="span">...</Text>
   ```

3. **Используй универсальные компоненты вместо специфичных**
   ```tsx
   <Heading level={3} variant="card-title">...</Heading>
   ```

4. **Добавляй новые токены в `typography.ts` для повторяющихся стилей**
   ```typescript
   figma: {
     'new-style': 'text-[20px] font-medium leading-tight',
   }
   ```

5. **Используй TypeScript автокомплит для вариантов**
   - IDE покажет все доступные варианты
   - Опечатки будут подсвечены

### ❌ DON'T:

1. **НЕ используй хардкод цветов**
   ```tsx
   // ❌ ПЛОХО
   <div className="bg-[#526AC2]">
   ```

2. **НЕ используй хардкод типографики**
   ```tsx
   // ❌ ПЛОХО
   <p className="text-[22px] font-semibold">
   ```

3. **НЕ создавай специфичные компоненты для каждого случая**
   ```tsx
   // ❌ ПЛОХО
   function DoctorNameHeading() { ... }
   ```

4. **НЕ дублируй стили в разных компонентах**
   - Используй Design Tokens
   - Создавай переиспользуемые варианты

5. **НЕ игнорируй существующие варианты**
   - Проверь `typography.ts` перед созданием новых
   - Используй существующие варианты где возможно

---

## Migration Guide

### Пошаговая миграция компонента:

**Шаг 1: Идентифицировать хардкод**

```tsx
// Найти все:
// - bg-[#...]
// - text-[#...]
// - text-[22px]
// - font-semibold (без Design Tokens)
```

**Шаг 2: Заменить заголовки**

```tsx
// ❌ БЫЛО
<h3 className="text-[22px] font-semibold">
  Заголовок
</h3>

// ✅ СТАЛО
<Heading level={3} variant="card-title">
  Заголовок
</Heading>
```

**Шаг 3: Заменить текст**

```tsx
// ❌ БЫЛО
<p className="text-[16px] font-normal">
  Описание
</p>

// ✅ СТАЛО
<Text variant="doctor-description">
  Описание
</Text>
```

**Шаг 4: Заменить контейнеры**

```tsx
// ❌ БЫЛО
<div className="bg-white border-2 border-[#D8D8D8] rounded-[25px] p-6">

// ✅ СТАЛО
<Card variant="bordered">
```

**Шаг 5: Заменить кнопки**

```tsx
// ❌ БЫЛО
<button className="bg-[#526AC2] text-white px-6 py-3 rounded-[15px]">

// ✅ СТАЛО
<Button unidentVariant="primary">
```

**Шаг 6: Проверить**

```bash
# Проверить linter
npm run lint

# Проверить TypeScript
npm run type-check

# Запустить dev сервер
npm run dev
```

---

## Resources

- **Документация**: `nextjs/DESIGN_SYSTEM.md`
- **Философия**: `.cursor/rules/design-system-philosophy.mdc`
- **Design Tokens**: `nextjs/src/design-tokens/typography.ts`
- **Компоненты**: `nextjs/src/components/design-system/`
- **Примеры**: Refactored Doctor Card, Footer, Header

---

**Статус:** ✅ Актуально (2026-01-15)  
**Версия:** 1.0.0  
**Проект:** УниДент headless WordPress + Next.js
