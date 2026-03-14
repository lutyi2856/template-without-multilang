# Быстрый старт

## Шаг 1: Настройка

```bash
cp env.example .env
```

При необходимости отредактируйте `.env` и измените пароли.

## Шаг 2: Запуск

```bash
docker-compose up -d
```

## Шаг 3: Установка WordPress

1. Откройте http://localhost:8002
2. Следуйте инструкциям установки WordPress
3. При установке WordPress автоматически создаст `wp-config.php` с правильной кодировкой utf8mb4

## Шаг 4: Проверка кодировки

### Через phpMyAdmin

1. Откройте http://localhost:8082
2. Войдите (логин/пароль из `.env`)
3. Выберите базу `wp_new`
4. Проверьте кодировку: должна быть **utf8mb4_unicode_ci**

### Через командную строку

```bash
docker-compose exec db-new mariadb -u wp_user -pwp_password -e "SHOW VARIABLES LIKE 'character_set%';"
```

## Полезные команды

```bash
# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Перезапуск
docker-compose restart
```

## Важно

- WordPress доступен на **http://localhost:8002**
- phpMyAdmin на **http://localhost:8082**
- База данных на порту **3308**
- Все контейнеры изолированы и не конфликтуют с существующими

