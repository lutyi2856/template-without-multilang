# Дизайн-система УниДент

Современная, масштабируемая дизайн-система с Design Tokens подходом для headless WordPress + Next.js проекта.

## 🎯 Философия

### Основные принципы

1. **Все через переменные** - цвета и типографика только через Design Tokens
2. **Универсальные компоненты** - Text/Heading вместо множества специфичных компонентов
3. **Design Tokens подход** - Single Source of Truth для всех стилей
4. **Consistency первее гибкости** - предпочитаем готовые варианты, а не custom стили
5. **Performance-first** - Server Components по умолчанию, минимум JavaScript

> 📖 Полная философия: `.cursor/rules/design-system-philosophy.mdc`

### Архитектура

```
nextjs/src/
  design-tokens/
    typography.ts           # Single Source of Truth для типографики
  components/
    design-system/
      text.tsx             # Универсальный Text компонент
      heading.tsx          # Универсальный Heading компонент
      button.tsx           # Button с preset стилями УниДент
      card.tsx             # Card с preset стилями УниДент
      badge.tsx            # Badge для рейтингов и меток
      container.tsx        # Layout контейнер
      section.tsx          # Layout секция
    ui/                    # Shadcn/ui компоненты
      dialog.tsx
      select.tsx
      ...
```

---

## 📐 Design Tokens - Типографика

### Что такое Design Tokens?

**Design Tokens = словарь стилей с семантическими именами**

Все типографические стили хранятся в **одном файле**: `src/design-tokens/typography.ts`

### Преимущества подхода:

- ✅ **Масштабируемость** - изменение в одном месте → работает везде
- ✅ **Семантика** - `variant="doctor-description"` понятнее чем `text-[16px]...`
- ✅ **TypeScript автокомплит** - IDE подсказывает доступные варианты
- ✅ **Связь с Figma** - явное соответствие дизайну
- ✅ **Нет дублирования** - DRY принцип

### Доступные токены

#### Body варианты (базовый текст)

```typescript
variant="default"  // 16px, font-normal
variant="large"    // 18px, font-normal
variant="small"    // 14px, font-normal
variant="xs"       // 12px, font-normal
```

#### Heading варианты (заголовки)

```typescript
variant="page-title"     // 48px, font-bold - H1
variant="section-title"  // 32px, font-bold - H2
variant="card-title"     // 22px, font-semibold - H3
variant="subsection"     // 20px, font-semibold - H4
```

#### Figma варианты (специфичные для дизайна)

```typescript
// Doctor Card
variant="doctor-name"         // 22px, font-semibold, line-height: 1.19
variant="doctor-description"  // 16px, font-normal, line-height: 1.25
variant="clinic-name"         // 16px, font-medium, line-height: 1.18

// Badges
variant="experience-number"   // 19px, font-medium, letter-spacing: -4%
variant="experience-label"    // 8px, font-medium, uppercase
variant="rating-number"       // 17px, font-medium, letter-spacing: -4%
variant="rating-source"       // 8.5px, font-medium

// UI элементы
variant="button-text"         // 16px, font-semibold, line-height: 1.1
variant="nav-link"            // 16px, font-medium
variant="label"               // 14px, font-medium
```

---

## 🧩 Компоненты

### Typography

#### Text Component

Универсальный компонент для всего текста (параграфы, spans, labels).

**Props:**
- `variant` - стиль из Design Tokens
- `as` - HTML тег (p, span, div, label)
- `className` - дополнительные стили

**Примеры:**

```tsx
import { Text } from '@/components/design-system';

// Базовое использование
<Text>Обычный текст</Text>

// С вариантами
<Text variant="default">Обычный текст (16px)</Text>
<Text variant="small">Маленький текст (14px)</Text>
<Text variant="large">Большой текст (18px)</Text>

// Figma варианты
<Text variant="doctor-description">
  Стоматолог-терапевт с 15-летним опытом
</Text>

<Text variant="clinic-name" as="span">
  Клиника на Новослободской
</Text>

// С дополнительными стилями
<Text variant="default" className="mb-4 text-unident-textGray">
  Вторичный текст с отступом
</Text>
```

**❌ НЕ делать:**

```tsx
// ❌ ПЛОХО - хардкод стилей
<p className="text-[16px] font-normal leading-[1.25]">
  Описание
</p>
```

**✅ Делать:**

```tsx
// ✅ ХОРОШО - через Design Tokens
<Text variant="doctor-description">
  Описание
</Text>
```

#### Heading Component

Универсальный компонент для заголовков (H1-H6).

**Props:**
- `level` - уровень заголовка (1-6) для SEO
- `variant` - стиль из Design Tokens (опционально)
- `className` - дополнительные стили

**Примеры:**

```tsx
import { Heading } from '@/components/design-system';

// Базовое использование (автоматический variant по level)
<Heading level={1}>Заголовок страницы</Heading>
<Heading level={2}>Заголовок секции</Heading>
<Heading level={3}>Заголовок карточки</Heading>

// С явным variant
<Heading level={3} variant="card-title">
  Иванов Иван Иванович
</Heading>

// С дополнительными стилями
<Heading level={1} variant="page-title" className="mb-8 text-center">
  Стоматологическая клиника УниДент
</Heading>
```

### Basics

#### Button Component

Кнопка с preset стилями УниДент.

**Props:**
- `unidentVariant` - preset стиль (primary, secondary, outline)
- Все props от shadcn/ui Button

**Примеры:**

```tsx
import { Button } from '@/components/design-system';

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

// С disabled
<Button unidentVariant="primary" disabled>
  Недоступно
</Button>
```

#### Card Component

Карточка с preset стилями УниДент.

**Props:**
- `variant` - стиль карточки (default, bordered, elevated)

**Примеры:**

```tsx
import { Card } from '@/components/design-system';

// Карточка с границей (default)
<Card variant="bordered">
  <Heading level={3}>Заголовок</Heading>
  <Text>Содержимое карточки</Text>
</Card>

// Карточка без границы
<Card variant="default">
  Чистая карточка без границы
</Card>

// Карточка с тенью
<Card variant="elevated">
  Карточка с тенью
</Card>

// С дополнительными стилями
<Card variant="bordered" className="hover:shadow-lg transition-shadow">
  Интерактивная карточка
</Card>
```

#### Badge Component

Бейдж для рейтингов, меток, статусов.

**Props:**
- `variant` - стиль бейджа (rating, experience, default)

**Примеры:**

```tsx
import { Badge } from '@/components/design-system';

// Бейдж рейтинга
<Badge variant="rating">
  4.7 ★
</Badge>

// Бейдж стажа
<Badge variant="experience">
  36 лет
</Badge>

// Default бейдж
<Badge variant="default">
  Новинка
</Badge>
```

### Layout

#### Container Component

Layout контейнер для центрирования контента.

```tsx
import { Container } from '@/components/design-system';

<Container>
  <Heading level={1}>Заголовок</Heading>
  <Text>Контент в контейнере</Text>
</Container>
```

#### Section Component

Layout секция для группировки контента.

```tsx
import { Section } from '@/components/design-system';

<Section>
  <Container>
    <Heading level={2}>Наши услуги</Heading>
    {/* Контент секции */}
  </Container>
</Section>
```

---

## 📚 Примеры паттернов

### Карточка врача (refactored)

**❌ До рефакторинга:**

```tsx
<div className="bg-white border-2 border-[#D8D8D8] rounded-[25px] p-6">
  <h3 className="text-[#191E35] text-[22px] font-semibold leading-[1.19]">
    Иванов Иван Иванович
  </h3>
  <p className="text-[#191E35] text-[16px] font-normal leading-[1.25]">
    Стоматолог-терапевт, ортопед
  </p>
  <span className="text-[#191E35] text-[16px] font-medium leading-[1.18]">
    Клиника на Новослободской
  </span>
  <div className="bg-[#D9E4F7] text-[#191E35] px-3 py-1.5 rounded-[10px]">
    4.7 ★
  </div>
</div>
```

**Проблемы:**
- ❌ Хардкод цветов - сложно изменить глобально
- ❌ Хардкод типографики - дублирование стилей
- ❌ Нет семантики - неясно что каждый элемент означает
- ❌ Низкая поддерживаемость - нужно менять в каждом месте

**✅ После рефакторинга:**

```tsx
import { Card, Heading, Text, Badge } from '@/components/design-system';

<Card variant="bordered">
  <Heading level={3} variant="card-title">
    Иванов Иван Иванович
  </Heading>
  <Text variant="doctor-description">
    Стоматолог-терапевт, ортопед
  </Text>
  <Text variant="clinic-name" as="span">
    Клиника на Новослободской
  </Text>
  <Badge variant="rating">
    4.7 ★
  </Badge>
</Card>
```

**Выгоды:**
- ✅ **Читаемость** - понятно что каждый элемент делает
- ✅ **Поддерживаемость** - изменение стилей в одном месте
- ✅ **Consistency** - все карточки выглядят одинаково
- ✅ **TypeScript** - автокомплит и проверка типов
- ✅ **Семантика** - variant="doctor-description" говорит само за себя

### Кнопка записи

**❌ До:**

```tsx
<button className="bg-[#526AC2] hover:bg-[#607BD4] text-white font-[Gilroy] font-semibold text-[16px] px-6 py-3 rounded-[15px]">
  Записаться
</button>
```

**✅ После:**

```tsx
<Button unidentVariant="primary">
  Записаться
</Button>
```

---

## 🔄 Migration Guide

### Шаг 1: Заменить хардкод текста на Text

**Было:**

```tsx
<p className="text-[16px] font-normal leading-[1.25]">
  Описание
</p>
```

**Стало:**

```tsx
<Text variant="doctor-description">
  Описание
</Text>
```

### Шаг 2: Заменить h1-h6 на Heading

**Было:**

```tsx
<h3 className="text-[22px] font-semibold">
  Заголовок
</h3>
```

**Стало:**

```tsx
<Heading level={3} variant="card-title">
  Заголовок
</Heading>
```

### Шаг 3: Заменить кнопки на Button

**Было:**

```tsx
<button className="bg-[#526AC2] text-white px-6 py-3 rounded-[15px]">
  Кнопка
</button>
```

**Стало:**

```tsx
<Button unidentVariant="primary">
  Кнопка
</Button>
```

### Шаг 4: Обернуть карточки в Card

**Было:**

```tsx
<div className="bg-white border-2 border-[#D8D8D8] rounded-[25px] p-6">
  Содержимое
</div>
```

**Стало:**

```tsx
<Card variant="bordered">
  Содержимое
</Card>
```

### Шаг 5: Заменить бейджи на Badge

**Было:**

```tsx
<div className="bg-[#D9E4F7] px-3 py-1.5 rounded-[10px]">
  4.7 ★
</div>
```

**Стало:**

```tsx
<Badge variant="rating">
  4.7 ★
</Badge>
```

---

## 🎨 Цвета

Все цвета хранятся в `tailwind.config.js` под `colors.unident.*` и в `globals.css` как CSS переменные.

### Основные цвета

```javascript
// Используйте в коде:
className="bg-unident-primary"       // #526AC2 - Основной синий (кнопки, бейджи)
className="text-unident-dark"        // #191E35 - Темный текст
className="bg-unident-white"         // #FFFFFF - Белый
```

### Цвета фонов

```javascript
className="bg-unident-bgLightBlue"   // #D9E4F7 - Светлый голубой (бейдж рейтинга)
className="bg-unident-bgLightGray"   // #EEF3F9 - Светлый серый (бейдж стажа)
className="bg-unident-bgTopbar"      // #F9F9F9 - Фон топбара
className="bg-unident-bgElements"    // #F5F7F9 - Фон элементов (поиск)
className="bg-unident-footer"        // #2F375F - Цвет футера
```

### Цвета границ и текста

```javascript
className="border-unident-borderGray" // #D8D8D8 - Серая рамка карточек
className="text-unident-textGray"     // #8F8F8F - Серый текст (вторичный)
className="bg-unident-primaryLight"   // #607BD4 - Светлый синий (hover)
```

### CSS переменные

Доступны также как CSS переменные в `globals.css`:

```css
var(--color-primary)          /* #526AC2 */
var(--color-dark)             /* #191E35 */
var(--color-white)            /* #FFFFFF */
var(--color-bg-light-blue)    /* #D9E4F7 */
var(--color-bg-light-gray)    /* #EEF3F9 */
var(--color-footer)           /* #2F375F */
var(--color-border-gray)      /* #D8D8D8 */
var(--color-text-gray)        /* #8F8F8F */
```

---

## 📝 Шрифты

Основной шрифт проекта: **Montserrat** (Google Font, автоматически оптимизируется через next/font/google)

### Почему Montserrat?

- ✅ **Надежная альтернатива Gilroy** (~80% визуальной похожести)
- ✅ **Geometric sans-serif** - тот же стиль, что у Gilroy
- ✅ **Отличная кириллица** - полная поддержка русского языка
- ✅ **Бесплатный** - без ограничений лицензии
- ✅ **Автооптимизация** - Next.js оптимизирует загрузку
- ✅ **Проверенный временем** - используется миллионами сайтов

**Альтернативы:** Red Hat Display, Plus Jakarta Sans, Inter

### Доступные начертания

- 400 (Regular) - обычный текст
- 500 (Medium) - кнопки, лейблы
- 600 (SemiBold) - заголовки
- 700 (Bold) - акценты

### Использование в коде

```javascript
// Шрифт применяется автоматически ко всему body
// Для явного указания:
className="font-gilroy"   // алиас Montserrat (для обратной совместимости)
className="font-montserrat" // явное указание Montserrat
className="font-sans"     // тоже самое (Montserrat - дефолтный sans)
```

---

## 🔄 Как изменить стили глобально

### Изменить цвет

1. Отредактируйте `tailwind.config.js` → `colors.unident.*`
2. Все компоненты обновятся автоматически

```javascript
// tailwind.config.js
unident: {
  primary: '#NEW_COLOR', // Изменить здесь
}
```

### Изменить типографику

1. Отредактируйте `src/design-tokens/typography.ts`
2. Все компоненты обновятся автоматически

```typescript
// design-tokens/typography.ts
figma: {
  'doctor-description': 'text-[18px] font-normal leading-[1.25]', // Изменить здесь
}
```

### Добавить новый токен типографики

1. Добавить в `design-tokens/typography.ts`:

```typescript
figma: {
  'new-style': 'text-[20px] font-medium leading-tight',
}
```

2. Использовать:

```tsx
<Text variant="new-style">
  Текст с новым стилем
</Text>
```

---

## ⚠️ Важно - Что ЗАПРЕЩЕНО

### ❌ Хардкод цветов

```tsx
// ❌ ПЛОХО
<div className="bg-[#526AC2]">
<div style={{ color: '#191E35' }}>
```

### ❌ Хардкод типографики

```tsx
// ❌ ПЛОХО
<p className="text-[16px] font-normal leading-[1.25]">
<h3 className="text-[22px] font-semibold">
```

### ❌ Создание специфичных компонентов

```tsx
// ❌ ПЛОХО - НЕ создавать
function DoctorNameText() { ... }
function H1() { ... }
function PrimaryButton() { ... }
```

### ✅ Правильно - используй универсальные компоненты

```tsx
// ✅ ХОРОШО
<Text variant="doctor-name">
<Heading level={1}>
<Button unidentVariant="primary">
```

---

## 📊 Метрики успеха

После внедрения дизайн-системы:

- ✅ 0 использований `bg-[#...]` (arbitrary colors)
- ✅ 0 использований `text-[22px]` напрямую (используем токены)
- ✅ Все текст через `<Text variant="...">` или `<Heading variant="...">`
- ✅ Все кнопки через `<Button unidentVariant="...">`
- ✅ Все карточки через `<Card variant="...">`
- ✅ Single Source of Truth в `design-tokens/typography.ts`
- ✅ TypeScript автокомплит работает везде
- ✅ Централизованная документация

---

## 📚 Дополнительные ресурсы

- **Философия**: `.cursor/rules/design-system-philosophy.mdc`
- **Design Tokens**: `src/design-tokens/typography.ts`
- **Компоненты**: `src/components/design-system/`
- **Performance**: `.cursor/rules/performance-philosophy.mdc`
- **Figma макет**: `Шаблон сайта` (file key: JPVOauS3F3bEIy1msJXPeR)

---

**Версия:** 2.0.0  
**Дата обновления:** 2026-01-15  
**Подход:** Design Tokens + Component-first
