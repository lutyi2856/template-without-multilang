# Настройка Faust.js для Headless WordPress + Next.js

## ✅ Что установлено и настроено

### WordPress (контейнер на порту 8002):
- ✅ **WPGraphQL** - установлен и активирован
- ✅ **FaustWP** - установлен и активирован
- ✅ **Headless Theme** - установлена и активирована
- ✅ **Front-end site URL** - установлен: `http://localhost:3000`
- ✅ **Permalinks** - настроены: Custom Structure `/blog/%postname%/`
- ✅ **WPGraphQL Public Introspection** - включен

### Next.js:
- ✅ **@faustwp/core** - добавлен в package.json
- ✅ **@faustwp/cli** - добавлен в package.json
- ✅ Конфигурация Faust.js создана

## 📋 Шаги настройки

### 1. Настройки WordPress (✅ ВЫПОЛНЕНО)

**Все необходимые настройки уже выполнены согласно [официальной документации Faust.js](https://faustjs.org/docs/tutorial/learn-faust/):**

1. ✅ **Front-end site URL** установлен: `http://localhost:3000`
   - Настройка: Settings → Faust → Front-end site URL
   
2. ✅ **Permalinks** настроены: Custom Structure `/blog/%postname%/`
   - Настройка: Settings → Permalinks → Custom Structure
   - Это позволяет постам иметь URLs вида: `http://localhost:3000/blog/hello-world/`
   
3. ✅ **WPGraphQL Public Introspection** включен
   - Настройка: GraphQL → Settings → Enable Public Introspection
   - Позволяет Faust.js выполнять introspection query для получения доступных GraphQL типов и полей

4. ✅ **Secret Key** получен: `3e42bfd3-7b92-4a0b-8a55-6987f5fb1312`
   - Настройка: Settings → Faust → Secret Key

**Для проверки настроек:**
- Откройте WordPress админку: http://localhost:8002/wp-admin
- Перейдите в **Settings → Faust** - должно быть заполнено поле "Front-end site URL"
- Перейдите в **Settings → Permalinks** - должна быть выбрана Custom Structure `/blog/%postname%/`
- Перейдите в **GraphQL → Settings** - должна быть включена опция "Enable Public Introspection"

### 2. Настройте переменные окружения Next.js

Создайте файл `nextjs/.env.local`:

```bash
cd nextjs
cp .env.local.example .env.local
```

Отредактируйте `.env.local` и вставьте ключи из WordPress:

```env
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8002
FAUSTWP_SECRET_KEY=ваш-secret-key-из-wordpress
FAUSTWP_PREVIEW_SECRET=ваш-preview-secret-из-wordpress
```

### 3. Установите зависимости Next.js

```bash
cd nextjs
npm install
```

### 4. Инициализируйте Faust.js

```bash
cd nextjs
npx @faustwp/cli init
```

Это создаст необходимые файлы и структуру.

### 5. Запустите Next.js

```bash
cd nextjs
npm run dev
```

Next.js будет доступен на http://localhost:3000

## 🔗 Интеграция

### Превью в WordPress

После настройки:
1. Создайте или отредактируйте пост в WordPress
2. Нажмите **"Preview"**
3. Откроется превью на Next.js фронтенде (не JSON!)

### GraphQL Endpoint

Faust.js использует WPGraphQL для получения данных:
- **GraphQL Endpoint**: http://localhost:8002/graphql
- **GraphiQL IDE**: http://localhost:8002/wp-admin/admin.php?page=graphiql-ide

## 📁 Структура проекта

```
nextjs/
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout с FaustProvider
│       └── page.tsx        # Главная страница
├── faust.config.js         # Конфигурация Faust.js
├── next.config.js          # Конфигурация Next.js
├── .env.local              # Переменные окружения (создать!)
└── package.json            # Зависимости
```

## 🛠️ Полезные команды

### WordPress (через WP-CLI):

```bash
# Проверить статус плагинов
docker-compose exec wordpress-new wp plugin list --allow-root --path=/var/www/html

# Проверить настройки FaustWP
docker-compose exec wordpress-new wp option get faustwp_settings --allow-root --path=/var/www/html --format=json
```

### Next.js:

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Продакшн
npm start
```

## ✅ Проверка работы

1. **WordPress GraphQL**: http://localhost:8002/graphql
2. **Next.js приложение**: http://localhost:3000
3. **Превью**: Создайте пост в WordPress → Preview → должен открыться Next.js фронт

## 🔧 Troubleshooting

### Проблема: Не работает превью

**Решение:**
1. Проверьте, что `FAUSTWP_SECRET_KEY` и `FAUSTWP_PREVIEW_SECRET` правильные
2. Убедитесь, что Next.js запущен на http://localhost:3000
3. Проверьте настройки FaustWP в WordPress админке

### Проблема: Ошибки GraphQL

**Решение:**
1. Убедитесь, что WPGraphQL активирован
2. Проверьте GraphQL endpoint: http://localhost:8002/graphql
3. Проверьте логи Next.js

### Проблема: Изображения не загружаются

**Решение:**
1. Проверьте `next.config.js` - должны быть правильные домены
2. Убедитесь, что WordPress доступен по указанному URL

## 📚 Дополнительные ресурсы

- [Faust.js Documentation](https://faustjs.org/)
- [FaustWP Plugin](https://wordpress.org/plugins/faustwp/)
- [WPGraphQL Documentation](https://www.wpgraphql.com/)

