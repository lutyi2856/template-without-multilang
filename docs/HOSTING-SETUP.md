# Развертывание WordPress на Shared Hosting

Эта инструкция поможет развернуть WordPress часть проекта на shared hosting.

## Подготовка

### Требования к хостингу
- PHP 8.0 или выше
- MySQL/MariaDB 10.3 или выше
- Минимум 512MB RAM
- Поддержка SSL/HTTPS
- Доступ через FTP/SFTP
- Опционально: SSH доступ для Git

### Что нужно перед началом
- Учетные данные FTP/SFTP
- Данные базы данных (имя, пользователь, пароль, хост)
- Домен, настроенный на хостинге

## Вариант 1: Развертывание через Git (рекомендуется)

Если ваш хостинг поддерживает Git:

### Шаг 1: Подключение к хостингу через SSH

```bash
ssh username@your-hosting.com
```

### Шаг 2: Клонирование репозитория

```bash
cd public_html  # или www, или htdocs - зависит от хостинга
git clone https://github.com/lutyi2856/headless-wp-nextjs.git .
```

### Шаг 3: Настройка wp-config.php

Создайте файл `wp-config.php` в корне проекта:

```php
<?php
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASSWORD', 'your_database_password');
define('DB_HOST', 'localhost'); // или другой хост от хостинга
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// Секретные ключи WordPress
// Получите с https://api.wordpress.org/secret-key/1.1/salt/
define('AUTH_KEY',         'вставьте сюда уникальную фразу');
define('SECURE_AUTH_KEY',  'вставьте сюда уникальную фразу');
define('LOGGED_IN_KEY',    'вставьте сюда уникальную фразу');
define('NONCE_KEY',        'вставьте сюда уникальную фразу');
define('AUTH_SALT',        'вставьте сюда уникальную фразу');
define('SECURE_AUTH_SALT', 'вставьте сюда уникальную фразу');
define('LOGGED_IN_SALT',   'вставьте сюда уникальную фразу');
define('NONCE_SALT',       'вставьте сюда уникальную фразу');

$table_prefix = 'wp_';

// Настройки для production
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', false);

// URL сайта
define('WP_HOME', 'https://yourdomain.com');
define('WP_SITEURL', 'https://yourdomain.com');

// Безопасность
define('DISALLOW_FILE_EDIT', true);
define('FORCE_SSL_ADMIN', true);

// Подключение кастомных настроек
if (file_exists(__DIR__ . '/wp-config-custom.php')) {
    require_once __DIR__ . '/wp-config-custom.php';
}

require_once ABSPATH . 'wp-settings.php';
```

### Шаг 4: Обновление через Git

При обновлении проекта:

```bash
cd public_html
git pull origin main
```

## Вариант 2: Развертывание через FTP

Если Git недоступен:

### Шаг 1: Подготовка файлов локально

1. Клонируйте репозиторий локально:
```bash
git clone https://github.com/lutyi2856/headless-wp-nextjs.git
cd headless-wp-nextjs
```

2. Убедитесь, что у вас установлен WordPress core (если нет, скачайте с wordpress.org)

3. Подготовьте структуру:
   - WordPress core файлы
   - `wp-content/mu-plugins/` из репозитория
   - `wp-config-custom.php` из репозитория
   - Другие файлы конфигурации

### Шаг 2: Загрузка через FTP

Используйте FTP клиент (FileZilla, WinSCP) для загрузки:

1. Подключитесь к хостингу
2. Загрузите все файлы в `public_html` (или `www`, `htdocs`)
3. Убедитесь, что права доступа правильные:
   - Папки: 755
   - Файлы: 644
   - `wp-config.php`: 600 (только владелец может читать)

### Шаг 3: Создание wp-config.php

Создайте `wp-config.php` на хостинге (см. пример выше в Варианте 1).

## Настройка базы данных

### Шаг 1: Создание базы данных

1. Войдите в панель управления хостингом (cPanel, Plesk и т.д.)
2. Создайте новую базу данных MySQL
3. Создайте пользователя базы данных
4. Назначьте пользователю все права на базу данных
5. Запишите данные: имя БД, пользователь, пароль, хост

### Шаг 2: Импорт базы данных

#### Вариант A: Через phpMyAdmin
1. Откройте phpMyAdmin в панели хостинга
2. Выберите вашу базу данных
3. Перейдите на вкладку "Импорт"
4. Выберите SQL дамп (если есть) и загрузите

#### Вариант B: Через командную строку (SSH)
```bash
mysql -u database_user -p database_name < dump.sql
```

#### Вариант C: Через WP-CLI (если установлен)
```bash
wp db import dump.sql
```

### Шаг 3: Обновление URL в базе данных

Если вы переносите с локального окружения, нужно обновить URL:

```sql
UPDATE wp_options SET option_value = 'https://yourdomain.com' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'https://yourdomain.com' WHERE option_name = 'home';
```

Или через WP-CLI:
```bash
wp search-replace 'http://localhost:8002' 'https://yourdomain.com'
```

## Установка плагинов

### Обязательные плагины
1. **WPGraphQL** - GraphQL API
2. **FaustWP** - Интеграция с Next.js
3. **WPGraphQL ACF** - Поддержка ACF полей
4. **Advanced Custom Fields Pro** - Кастомные поля
5. **WordPress MCP** - MCP интеграция (опционально)

### Установка через админку
1. Войдите в WordPress админку: `https://yourdomain.com/wp-admin`
2. Перейдите в **Плагины → Добавить новый**
3. Установите необходимые плагины

### Установка через WP-CLI (если доступен)
```bash
wp plugin install wp-graphql --activate
wp plugin install faustwp --activate
wp plugin install wp-graphql-acf --activate
```

## Настройка SSL/HTTPS

1. Установите SSL сертификат через панель хостинга (Let's Encrypt обычно бесплатно)
2. Убедитесь, что в `wp-config.php` указаны правильные URL с `https://`
3. При необходимости добавьте редирект с HTTP на HTTPS в `.htaccess`:

```apache
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

## Настройка переменных окружения

Если хостинг поддерживает переменные окружения, создайте файл `.env` или настройте через панель хостинга:

```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
WP_DEBUG=false
```

## Настройка для Next.js

После настройки WordPress, получите данные для Next.js:

1. Войдите в WordPress админку
2. Перейдите в **Settings → Faust**
3. Скопируйте:
   - **Secret Key** - для `FAUSTWP_SECRET_KEY`
   - **Preview Secret** - для `FAUSTWP_PREVIEW_SECRET`
4. Используйте эти значения при настройке Vercel (см. [VERCEL-SETUP.md](VERCEL-SETUP.md))

## Проверка работы

1. Откройте сайт: `https://yourdomain.com`
2. Проверьте GraphQL endpoint: `https://yourdomain.com/graphql`
3. Проверьте админку: `https://yourdomain.com/wp-admin`

## Обновление проекта

### Через Git
```bash
cd public_html
git pull origin main
```

### Через FTP
1. Скачайте обновленные файлы из репозитория
2. Загрузите их через FTP, заменив старые файлы
3. Исключите `wp-content/uploads/` и другие пользовательские данные

## Безопасность

- Используйте сильные пароли для базы данных и админки
- Регулярно обновляйте WordPress и плагины
- Используйте SSL/HTTPS
- Ограничьте доступ к `wp-config.php` (права 600)
- Регулярно делайте резервные копии
- Используйте плагины безопасности (Wordfence, iThemes Security)

## Резервное копирование

### Через панель хостинга
Большинство хостингов предоставляют инструменты для резервного копирования.

### Вручную
1. Экспорт базы данных через phpMyAdmin
2. Скачивание файлов через FTP
3. Хранение резервных копий в безопасном месте

## Решение проблем

### Ошибка подключения к базе данных
- Проверьте данные в `wp-config.php`
- Убедитесь, что пользователь БД имеет права доступа
- Проверьте хост БД (может быть не `localhost`)

### Ошибки прав доступа
- Установите правильные права: папки 755, файлы 644
- `wp-config.php` должен быть 600

### Плагины не работают
- Проверьте версию PHP (нужна 8.0+)
- Проверьте логи ошибок в панели хостинга
- Временно включите `WP_DEBUG` для диагностики

### GraphQL не работает
- Убедитесь, что плагин WPGraphQL установлен и активирован
- Проверьте права доступа к API
- Проверьте настройки в **GraphQL → Settings**

