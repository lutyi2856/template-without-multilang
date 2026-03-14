# Chat Summary: WPGraphQL Nested Types Debugging

**Дата:** 2026-01-12
**Задача:** Отладка headerSettings GraphQL query (workingHours, locationsCount, reviewsCount возвращали null)

---

## ✅ ЧТО РАБОТАЕТ

1. **WordPress Backend полностью настроен:**
   - CPT: `services`, `promotions`
   - Taxonomy: `service_categories`
   - ACF Option Page: "Header Settings" с полями: phone, email, working_hours (group), locations_count, reviews_count
   - ACF поля для `nav_menu_item`: badge_count, icon, mega_menu_enabled, mega_menu_categories
   - Меню "primary" с 7 пунктами, бейджи работают ("Акции 3", "Отзывы 99+")

2. **Header компонент отображается:**
   - Меню работает ✅
   - `phone`: "+7 (495) 123-45-67" ✅
   - `email`: "info@unident.ru" ✅

3. **GraphQL queries:**
   - `GET_PRIMARY_MENU` ✅
   - `GET_ALL_SERVICE_CATEGORIES` ✅
   - `GET_HEADER_SETTINGS` - частично ✅

---

## ⚠️ КРИТИЧЕСКАЯ ПРОБЛЕМА

**WPGraphQL НЕ мапит nested types и Int поля из `$source` автоматически!**

### Симптомы:

WordPress resolver возвращает:
```json
{
  "phone": "+7 (495) 123-45-67",
  "email": "info@unident.ru",
  "workingHours": {
    "weekdays": "Пн-Сб 10:00-22:00",
    "weekend": "Вс 9:00-16:00"
  },
  "locationsCount": 3,
  "reviewsCount": 1294
}
```

GraphQL response показывает:
```json
{
  "phone": "+7 (495) 123-45-67",  // ✅
  "email": "info@unident.ru",      // ✅
  "workingHours": {
    "weekdays": null,  // ❌
    "weekend": null    // ❌
  },
  "locationsCount": null,  // ❌
  "reviewsCount": null     // ❌
}
```

### Причина:

- ✅ Простые String поля первого уровня - мапятся автоматически
- ❌ Nested GraphQL types (`HeaderSettingsWorkingHours`) - НЕ мапятся
- ❌ Int/Float поля без explicit resolver - НЕ мапятся
- ❌ Child resolvers - НЕ вызываются WPGraphQL

---

## 🔧 РЕШЕНИЕ: Flat Structure

### Последние изменения (применены, но требуют проверки):

1. **`wp-content/mu-plugins/unident-acf-fields.php`**
   - Удален nested type `HeaderSettingsWorkingHours`
   - Изменен на flat structure:
     - `workingHoursWeekdays` вместо `workingHours.weekdays`
     - `workingHoursWeekend` вместо `workingHours.weekend`
   - Удалены все child resolvers (не работают)
   - Resolver возвращает flat array

2. **`nextjs/src/lib/wordpress/queries/header.ts`**
   - Query обновлен:
   ```graphql
   workingHoursWeekdays
   workingHoursWeekend
   locationsCount
   reviewsCount
   ```

3. **`nextjs/src/types/header.ts`**
   - `HeaderSettings` interface - flat structure
   - Удален `WorkingHours` interface

### Статус после изменений:

**⚠️ Header НЕ отображается!** Требуется проверка логов Next.js (terminal 32).

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Проверить логи Next.js:**
   ```powershell
   Get-Content "c:\Users\Sergey\.cursor\projects\d-template\terminals\32.txt" | Select-String -Pattern "Error|headerSettings" -Context 3,3
   ```

2. **Если есть GraphQL ошибка:**
   - Проверить совместимость query с новой flat structure
   - Возможно, нужно обновить components, использующие headerSettings

3. **Если flat structure работает:**
   - Обновить компоненты Header/ContactInfo для работы с flat fields
   - Протестировать все поля (phone, email, workingHours*, locations, reviews)
   - Обновить TODO статус

4. **Если flat structure НЕ работает:**
   - Вариант A: Оставить только `phone`/`email` для MVP
   - Вариант B: Создать custom REST endpoint для headerSettings
   - Вариант C: Глубже исследовать WPGraphQL resolvers (может потребовать много времени)

---

## 📝 КРИТИЧНЫЕ ФАЙЛЫ

### WordPress (Backend):
- `wp-content/mu-plugins/unident-acf-fields.php` - ACF fields + GraphQL registration

### Next.js (Frontend):
- `nextjs/src/lib/wordpress/queries/header.ts` - GraphQL queries
- `nextjs/src/lib/wordpress/api-header.ts` - API functions для загрузки header data
- `nextjs/src/types/header.ts` - TypeScript types
- `nextjs/src/components/figma/header/header-v2.tsx` - Server Component
- `nextjs/src/components/figma/header/header-client-wrapper.tsx` - Client Component

### Логи для debugging:
- WordPress: `docker-compose exec wordpress-new tail -100 /var/www/html/wp-content/debug.log`
- Next.js: `c:\Users\Sergey\.cursor\projects\d-template\terminals\32.txt`

---

## 🆕 СОЗДАННЫЕ ПРАВИЛА

### `.cursor/rules/wpgraphql-nested-types-auto-mapping.mdc`

**Ключевые секции:**
1. Flat vs Nested structure (с примерами ❌/✅)
2. Int поля требуют explicit resolver
3. Child resolvers не вызываются
4. Debugging workflow
5. Migration guide от nested к flat
6. Troubleshooting checklist

**Обновлен:** `.cursor/rules/wpgraphql-acf-troubleshooting.mdc`
- Добавлена ссылка на новое правило
- Добавлен warning о nested types

---

## 🔗 TODO Список

1. [pending] **fix-header-settings-working-hours** - headerSettings: phone/email ✅ | workingHours/counts требуют проверки после flat structure
2. [pending] **integrate-header** - Интегрировать Header v2 в layout.tsx
3. [pending] **browser-testing** - Browser testing (mega-menu, responsiveness)
4. [pending] **download-figma-icons** - Скачать Figma иконки
5. [pending] **documentation** - Создать документацию для управления меню

---

## 💡 КОМАНДЫ ДЛЯ НОВОГО ЧАТА

### Проверка состояния:

```powershell
# Логи Next.js (проверить ошибки)
Get-Content "c:\Users\Sergey\.cursor\projects\d-template\terminals\32.txt" | Select-String -Pattern "Error|error|headerSettings" -Context 3,3

# Логи WordPress (проверить resolver output)
docker-compose exec wordpress-new tail -100 /var/www/html/wp-content/debug.log | Select-String -Pattern "HeaderSettings"

# Перезапуск (если нужно)
docker-compose restart wordpress-new
taskkill /F /IM node.exe
Remove-Item -Recurse -Force nextjs/.next
cd nextjs; npm run dev
```

### Тестирование в браузере:

```
http://localhost:3000
```

Проверить:
- Header отображается?
- Меню работает?
- Бейджи показываются?
- Phone/email видны?

---

## 📚 ПОЛЕЗНЫЕ ССЫЛКИ

- **Новое правило:** `.cursor/rules/wpgraphql-nested-types-auto-mapping.mdc`
- **Основное правило:** `.cursor/rules/wpgraphql-acf-troubleshooting.mdc`
- **Plan файл:** `c:\Users\Sergey\.cursor\plans\universal_wordpress_menu_system_3c0e9413.plan.md`

---

## 🎓 КЛЮЧЕВЫЕ ИНСАЙТЫ

1. **WPGraphQL auto-mapping работает ТОЛЬКО для простых полей первого уровня**
2. **Nested types требуют manual mapping через explicit resolvers**
3. **Child resolvers НЕ ВЫЗЫВАЮТСЯ для nested types → используй flat structure**
4. **Int/Float поля требуют явного приведения типа: `(int) $value`**
5. **ACF Option Pages требуют manual GraphQL registration (не автоматически)**
6. **WordPress debug.log + Next.js server logs = лучший способ debugging**

---

**Передай этот файл в новый чат для продолжения работы!**
