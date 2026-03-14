# Быстрый старт Faust.js

## ✅ Что уже готово

- ✅ **FaustWP** установлен в WordPress (версия 1.8.0)
- ✅ **WPGraphQL** установлен и активирован
- ✅ **Headless Theme** установлена и активирована
- ✅ Структура Next.js проекта создана

## 🚀 Запуск за 3 шага

### Шаг 1: Создайте .env.local

```bash
cd nextjs
copy env.local.example .env.local
```

Откройте `.env.local` и вставьте:

```env
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8002
FAUSTWP_SECRET_KEY=3e42bfd3-7b92-4a0b-8a55-6987f5fb1312
FAUSTWP_PREVIEW_SECRET=your-preview-secret-from-wordpress
```

### Шаг 2: Установите зависимости

```bash
npm install
```

### Шаг 3: Запустите Next.js

```bash
npm run dev
```

Откройте: http://localhost:3000

## 🎯 Что дальше?

1. **Проверьте GraphQL**: http://localhost:8002/graphql
2. **Создайте пост в WordPress** → нажмите Preview → должен открыться Next.js фронт
3. **Начните разработку** в `nextjs/src/app/`

## 📚 Полная инструкция

См. `FAUST-SETUP.md` для детальной настройки.

