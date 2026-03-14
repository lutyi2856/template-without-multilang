# Инструкция по установке проекта для менеджера

Эта инструкция поможет вам установить и запустить проект локально на вашем компьютере.

## Требования

Перед началом убедитесь, что у вас установлены:

- **Git** - для клонирования репозитория
- **Docker Desktop** - для запуска WordPress и базы данных
- **Node.js** (версия 18 или выше) - для Next.js
- **npm** или **yarn** - менеджер пакетов

## Шаг 1: Клонирование репозитория

Откройте терминал (PowerShell на Windows, Terminal на Mac/Linux) и выполните:

```bash
git clone https://github.com/lutyi2856/headless-wp-nextjs.git
cd headless-wp-nextjs
```

## Шаг 2: Настройка переменных окружения

Скопируйте файл с примерами переменных окружения:

```bash
copy env.example .env
```

На Windows PowerShell:
```powershell
Copy-Item env.example .env
```

Файл `.env` уже содержит значения по умолчанию, которые подойдут для локальной разработки. При необходимости вы можете их изменить.

## Шаг 3: Запуск Docker контейнеров

Запустите WordPress и базу данных через Docker:

```bash
docker-compose up -d
```

Эта команда:
- Скачает необходимые образы (если их нет)
- Создаст и запустит контейнеры
- Настроит базу данных

Подождите 30-60 секунд, пока контейнеры запустятся.

Проверить статус можно командой:
```bash
docker-compose ps
```

## Шаг 4: Установка зависимостей Next.js

Перейдите в папку Next.js и установите зависимости:

```bash
cd nextjs
npm install
```

Это может занять несколько минут.

## Шаг 5: Настройка Next.js переменных окружения

Скопируйте пример файла переменных окружения:

```bash
copy env.local.example .env.local
```

На Windows PowerShell:
```powershell
Copy-Item env.local.example .env.local
```

Откройте файл `.env.local` и проверьте настройки:
- `NEXT_PUBLIC_WORDPRESS_URL` должен быть `http://localhost:8002`
- Остальные значения можно оставить как есть или получить из WordPress (см. ниже)

## Шаг 6: Получение ключей из WordPress (опционально)

Если нужно настроить preview функциональность:

1. Откройте WordPress админку: http://localhost:8002/wp-admin
2. Перейдите в **Settings → Faust**
3. Скопируйте `Secret Key` и `Preview Secret`
4. Вставьте их в `nextjs/.env.local`

## Шаг 7: Запуск Next.js

Вернитесь в корневую папку проекта и запустите Next.js:

```bash
cd ..
cd nextjs
npm run dev
```

Next.js запустится на http://localhost:3000

## Проверка работы

Откройте в браузере:

- **WordPress**: http://localhost:8002
- **WordPress Admin**: http://localhost:8002/wp-admin
- **Next.js**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8082

## Остановка проекта

Чтобы остановить все контейнеры:

```bash
docker-compose down
```

Чтобы остановить Next.js, нажмите `Ctrl+C` в терминале, где он запущен.

## Обновление проекта

Когда в репозитории появляются новые изменения:

```bash
git pull origin main
```

Затем:
- Если обновились зависимости Next.js: `cd nextjs && npm install`
- Если обновились Docker конфигурации: `docker-compose up -d --build`

## Работа с проектом

### Добавление контента
- Используйте WordPress админку для добавления постов, страниц, медиафайлов
- Контент автоматически доступен через GraphQL API

### Разработка
- Файлы Next.js находятся в `nextjs/src/`
- Изменения в Next.js применяются автоматически (hot reload)
- Изменения в WordPress требуют перезапуска контейнера: `docker-compose restart wordpress-new`

### База данных
- Доступ через phpMyAdmin: http://localhost:8082
- Или через командную строку: `docker-compose exec db-new mysql -u wp_user -p wp_new`

## Решение проблем

### Порт уже занят
Если порт 8002, 3000 или 3308 занят:
- Остановите другие приложения, использующие эти порты
- Или измените порты в `docker-compose.yml` и `.env`

### Контейнеры не запускаются
```bash
docker-compose logs
```
Проверьте логи для выявления проблемы.

### Next.js не подключается к WordPress
- Убедитесь, что WordPress запущен: http://localhost:8002
- Проверьте `NEXT_PUBLIC_WORDPRESS_URL` в `nextjs/.env.local`
- Перезапустите Next.js

### База данных не работает
```bash
docker-compose restart db-new
```

## Дополнительная помощь

Если возникли проблемы:
1. Проверьте документацию в папке `docs/`
2. Проверьте логи: `docker-compose logs`
3. Обратитесь к команде разработки

