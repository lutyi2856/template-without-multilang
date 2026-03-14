# Отчет: Поля вкладки "Руководство" - Главная страница

## Текущая структура полей

Вкладка **"Руководство"** находится на странице опций WordPress: **"Настройки главной страницы"** (`mainpage-settings`)

### Список полей (6 полей):

| № | Label (Русский) | Name (ACF) | GraphQL Field | Тип | Описание |
|---|----------------|------------|---------------|-----|----------|
| 1 | **Изображение** | `guidance_image` | `guidanceImage` | Image | Изображение для раздела руководства |
| 2 | **Контент** | `guidance_content` | `guidanceContent` | WYSIWYG | Текстовый редактор для контента руководства |
| 3 | **Изображение руководителя** | `guidance_manager_image` | `guidanceManagerImage` | Image | Изображение руководителя |
| 4 | **Фамилия и имя** | `guidance_subscribe` | `guidanceSubscribe` | WYSIWYG | Фамилия и имя руководителя |
| 5 | **Должности** | `guidance_positions` | `guidancePositions` | Text | Текстовое поле "Должности" |
| 6 | **Медиа изображение** | `guidance_media_image` | `guidanceMediaImage` | Image | Медиа поле для изображения |

---

## GraphQL запрос

### Полный запрос всех полей главной страницы (включая Руководство):

```graphql
query GetMainPageSettings {
  mainPageSettings {
    # Hero блок
    heroImage {
      url
      width
      height
      alt
    }
    heroTitle
    heroSubtitle
    
    # Акция
    featuredAction {
      id
      title
    }
    
    # CTA блок
    ctaTitle
    ctaDescription
    ctaPhone
    ctaPrivacyText
    ctaDoctorImage {
      url
      width
      height
      alt
    }
    ctaBackgroundImage {
      url
      width
      height
      alt
    }
    
    # Руководство (Guidance)
    guidanceImage {
      url
      width
      height
      alt
    }
    guidanceContent
    guidanceManagerImage {
      url
      width
      height
      alt
    }
    guidanceSubscribe
    guidancePositions
    guidanceMediaImage {
      url
      width
      height
      alt
    }
  }
}
```

### Только поля Руководства:

```graphql
query GetGuidanceFields {
  mainPageSettings {
    guidanceImage {
      url
      width
      height
      alt
    }
    guidanceContent
    guidanceManagerImage {
      url
      width
      height
      alt
    }
    guidanceSubscribe
    guidancePositions
    guidanceMediaImage {
      url
      width
      height
      alt
    }
  }
}
```

---

## Типы данных GraphQL

### Тип изображения (MainPageCtaImage):

```graphql
type MainPageCtaImage {
  url: String      # URL изображения
  width: Int       # Ширина в пикселях
  height: Int      # Высота в пикселях
  alt: String      # Alt текст
}
```

### Тип MainPageSettings:

```graphql
type MainPageSettings {
  # ... другие поля ...
  
  guidanceImage: MainPageCtaImage
  guidanceContent: String          # HTML контент из WYSIWYG
  guidanceManagerImage: MainPageCtaImage
  guidanceSubscribe: String        # HTML контент из WYSIWYG
  guidancePositions: String        # Текст
  guidanceMediaImage: MainPageCtaImage
}
```

---

## Использование в Next.js

### 1. TypeScript типы:

```typescript
// types/mainpage-settings.ts

export interface MainPageImage {
  url: string | null;
  width: number | null;
  height: number | null;
  alt: string | null;
}

export interface MainPageSettings {
  // ... другие поля ...
  
  guidanceImage: MainPageImage | null;
  guidanceContent: string | null;
  guidanceManagerImage: MainPageImage | null;
  guidanceSubscribe: string | null;
  guidancePositions: string | null;
  guidanceMediaImage: MainPageImage | null;
}
```

### 2. GraphQL запрос:

```typescript
// lib/wordpress/queries/mainpage-settings.ts

import { gql } from "@apollo/client";

export const GET_MAIN_PAGE_SETTINGS = gql`
  query GetMainPageSettings {
    mainPageSettings {
      guidanceImage {
        url
        width
        height
        alt
      }
      guidanceContent
      guidanceManagerImage {
        url
        width
        height
        alt
      }
      guidanceSubscribe
      guidancePositions
      guidanceMediaImage {
        url
        width
        height
        alt
      }
    }
  }
`;
```

### 3. API функция:

```typescript
// lib/wordpress/api.ts

import { GET_MAIN_PAGE_SETTINGS } from "./queries/mainpage-settings";
import type { MainPageSettings } from "@/types/mainpage-settings";

export async function getMainPageSettings(): Promise<MainPageSettings | null> {
  try {
    const client = getApolloClient();
    
    const { data } = await client.query({
      query: GET_MAIN_PAGE_SETTINGS,
    });
    
    return data?.mainPageSettings || null;
  } catch (error) {
    console.error("[getMainPageSettings] Error:", error);
    return null;
  }
}
```

### 4. Использование в компоненте:

```typescript
// components/sections/guidance-section.tsx

import { getMainPageSettings } from "@/lib/wordpress";
import Image from "next/image";

export async function GuidanceSection() {
  const settings = await getMainPageSettings();
  
  if (!settings) {
    return null;
  }
  
  return (
    <section>
      {/* Изображение */}
      {settings.guidanceImage && (
        <Image
          src={settings.guidanceImage.url!}
          alt={settings.guidanceImage.alt || ""}
          width={settings.guidanceImage.width || 0}
          height={settings.guidanceImage.height || 0}
        />
      )}
      
      {/* Контент (WYSIWYG) */}
      {settings.guidanceContent && (
        <div dangerouslySetInnerHTML={{ __html: settings.guidanceContent }} />
      )}
      
      {/* Изображение руководителя */}
      {settings.guidanceManagerImage && (
        <Image
          src={settings.guidanceManagerImage.url!}
          alt={settings.guidanceManagerImage.alt || ""}
          width={settings.guidanceManagerImage.width || 0}
          height={settings.guidanceManagerImage.height || 0}
        />
      )}
      
      {/* Фамилия и имя (WYSIWYG) */}
      {settings.guidanceSubscribe && (
        <div dangerouslySetInnerHTML={{ __html: settings.guidanceSubscribe }} />
      )}
      
      {/* Должности */}
      {settings.guidancePositions && (
        <p>{settings.guidancePositions}</p>
      )}
      
      {/* Медиа изображение */}
      {settings.guidanceMediaImage && (
        <Image
          src={settings.guidanceMediaImage.url!}
          alt={settings.guidanceMediaImage.alt || ""}
          width={settings.guidanceMediaImage.width || 0}
          height={settings.guidanceMediaImage.height || 0}
        />
      )}
    </section>
  );
}
```

---

## Где редактировать данные

**WordPress Admin:**
1. Перейти в **"Главная страница"** (в меню слева)
2. Выбрать вкладку **"Руководство"**
3. Заполнить поля:
   - Изображение
   - Контент (текстовый редактор)
   - Изображение руководителя
   - Фамилия и имя (текстовый редактор)
   - Должности (текстовое поле)
   - Медиа изображение

---

## Важные замечания

1. **WYSIWYG поля** (`guidanceContent`, `guidanceSubscribe`) возвращают HTML строку - используйте `dangerouslySetInnerHTML` для отображения
2. **Image поля** возвращают объект с `url`, `width`, `height`, `alt` - используйте `next/image` для оптимизации
3. **Все поля опциональны** - проверяйте на `null` перед использованием
4. **Post ID:** `mainpage_options` (используется в `get_field()`)

---

**Дата создания:** 2026-02-05  
**Статус:** ✅ Активно  
**Версия:** 1.0.0
