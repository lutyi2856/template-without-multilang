# 🔌 MCP Серверы (Model Context Protocol)

> Документация по настройке и использованию MCP серверов в Cursor IDE

## ✅ Обзор

В проекте настроены **9 MCP серверов** для расширенной функциональности Cursor IDE:

### Основные серверы проекта

1. **wordpress-mcp** - Работа с WordPress (посты, страницы, пользователи, ACF поля)
2. **figma** - Официальный Figma MCP (генерация React компонентов из дизайна)
3. **figma-framelink** - Расширенный доступ к Figma API (скриншоты, метаданные)

### Вспомогательные серверы

4. **Ref** - Поиск документации по библиотекам и фреймворкам
5. **Sentry** - Мониторинг ошибок и аналитика
6. **sequential-thinking** - Расширенные возможности анализа
7. **memory** - Контекст и память AI
8. **github** - Интеграция с GitHub
9. **playwright** - Автоматизация браузера

## 📍 Где сохранены данные Figma в проекте

Данные из Figma (кэш, описания компонентов, выгруженные JSON) лежат в:

| Что | Путь |
|-----|------|
| **Главный кэш** (описание компонентов, node ID, ссылки на файлы) | `nextjs/figma-data/FIGMA_CACHE.md` |
| **JSON по компонентам** (rating, doctor_card, price и т.д.) | `nextjs/figma-data/components/*.json` |
| **Полные дампы Figma** (обход rate limit) | `nextjs/figma-data/full-figma-data-*.yaml` |
| **Скачанные изображения/иконки** | `nextjs/public/images/figma/` |

**Путь для Framelink `download_figma_images`:** `localPath: "nextjs/public/images/figma"` (относительно cwd). Абсолютный путь даёт ошибку "Directory traversal". В `.cursor/mcp.json` задан `cwd: "${workspaceFolder}"` — при старте из корня проекта файлы сохраняются в `nextjs/public/images/figma`. Подробности: [FIGMA_CACHE.md](../nextjs/figma-data/FIGMA_CACHE.md).

Перед запросами к Figma MCP имеет смысл проверять кэш: [nextjs/figma-data/FIGMA_CACHE.md](../nextjs/figma-data/FIGMA_CACHE.md).

### Проектная конфигурация (`.cursor/mcp.json`)

В корне проекта настроен **Framelink MCP** с `cwd: "${workspaceFolder}"` и переменной `FIGMA_ASSETS_PATH`. Переменная не используется инструментом `download_figma_images` — он принимает только `localPath` из вызова.

---

## 📋 Конфигурация

### Расположение файла MCP

**Windows**: `c:\Users\Sergey\.cursor\mcp.json`

### Текущая конфигурация

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "args": [],
      "command": "mcp-server-sequential-thinking"
    },
    "playwright": {
      "args": [],
      "command": "mcp-server-playwright"
    },
    "memory": {
      "args": [],
      "command": "mcp-server-memory"
    },
    "github": {
      "command": "C:\\Users\\Sergey\\AppData\\Roaming\\npm\\mcp-server-github.cmd",
      "args": [],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    },
    "wordpress-mcp": {
      "command": "npx",
      "args": ["-y", "@automattic/mcp-wordpress-remote@latest"],
      "env": {
        "WP_API_URL": "http://localhost:8002",
        "JWT_TOKEN": "YOUR_JWT_TOKEN_HERE",
        "LOG_FILE": "D:\\template\\wordpress-mcp.log"
      }
    },
    "Sentry": {
      "url": "https://mcp.sentry.dev/mcp",
      "headers": {}
    },
    "Ref": {
      "type": "http",
      "url": "https://api.ref.tools/mcp?apiKey=YOUR_API_KEY_HERE",
      "headers": {}
    },
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp",
      "headers": {}
    },
    "figma-framelink": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "figma-developer-mcp",
        "--figma-api-key=YOUR_FIGMA_API_KEY_HERE",
        "--stdio"
      ]
    }
  }
}
```

## 🔧 Настройка серверов

### 1. WordPress MCP

**Документация**: [docs/CURSOR-MCP-SETUP.md](CURSOR-MCP-SETUP.md)

**Требования**:
- WordPress запущен на `http://localhost:8002`
- Плагин WordPress MCP установлен и активирован
- JWT токен получен из WordPress админки

**Как получить JWT токен**:
1. Откройте WordPress админку: http://localhost:8002/wp-admin
2. Перейдите в **Settings → MCP → Authentication Tokens**
3. Создайте новый токен (рекомендуется на 24 часа)
4. Скопируйте токен и вставьте в `mcp.json`

⚠️ **Важно**: JWT токены истекают через 2 часа (по умолчанию). Создавайте токены на 24 часа для стабильной работы.

### 2. Figma MCP (Официальный, OAuth)

**Официальная документация**: [Figma MCP — Remote server](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)

**Важно:** Официальный Figma MCP **не использует токен в headers**. Авторизация только через **OAuth** в браузере. Поле `"headers": {}` в конфиге — так и должно быть.

**Конфиг в `mcp.json`** (файл: `c:\Users\Sergey\.cursor\mcp.json`):
```json
"figma": {
  "type": "http",
  "url": "https://mcp.figma.com/mcp",
  "headers": {}
}
```

**Как включить (Cursor):**
1. Откройте настройки MCP в Cursor.
2. Найдите сервер **figma** и нажмите **Connect** (или **Install** → **Connect**).
3. В браузере откроется страница Figma — нажмите **Allow access**.
4. После успешной авторизации сервер будет отдавать данные (get_design_context, get_screenshot и т.д.).

**Если не работает:** убедитесь, что нажали именно **Connect** и **Allow access**; перезапустите Cursor и повторите подключение.

**Если Remote возвращает только Debug UUID (нет кода/скриншотов):** перейдите на **Desktop MCP** ниже — он даёт все 12 инструментов и полные ответы.

---

### 2b. Figma MCP — Desktop (локальный сервер) — рекомендуется для полных 12 инструментов

**Официальная документация:** [Figma MCP — Desktop server](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/)

Работает через **Figma desktop app**: MCP запускается внутри приложения, OAuth не нужен (используется ваш вход в Figma). Cursor поддерживает и Remote, и Desktop ([Figma MCP catalog](https://www.figma.com/mcp-catalog/)).

**Шаг 1 — Включить MCP в Figma desktop:**

1. Установите [Figma desktop app](https://www.figma.com/downloads/) и обновите до последней версии.
2. Откройте приложение и откройте любой **Design file** (или создайте).
3. Внизу переключитесь в **Dev Mode** (клавиша **Shift+D**).
4. В правой панели **Inspect** найдите блок **MCP server** → нажмите **Enable desktop MCP server**.
5. Должно появиться сообщение, что сервер запущен на `http://127.0.0.1:3845/mcp`. Не закрывайте Figma — сервер работает, пока открыто приложение.

**Шаг 2 — Добавить сервер в Cursor:**

1. **Cursor → Settings → Cursor Settings** (или **Tools & MCP**).
2. Вкладка **MCP** → **+ Add new global MCP server** (или отредактируйте `c:\Users\Sergey\.cursor\mcp.json` вручную).
3. Добавьте сервер (можно назвать `figma` или `figma-desktop`):

```json
"figma-desktop": {
  "type": "http",
  "url": "http://127.0.0.1:3845/mcp"
}
```

Если в Cursor используется общий блок `mcpServers`, итог должен быть таким:

```json
"mcpServers": {
  "figma-desktop": {
    "type": "http",
    "url": "http://127.0.0.1:3845/mcp"
  }
}
```

4. Сохраните конфиг, **полностью закройте Cursor** и откройте снова.
5. Убедитесь, что **Figma desktop app открыт** и MCP в нём включён. В Cursor в настройках MCP должен появиться сервер с полным набором инструментов (get_design_context, get_screenshot, get_metadata и др.).

**Использование:** можно передавать контекст по **ссылке** (URL с node-id) или по **выделению** в Figma (выделите фрейм в приложении и попросите в чате реализовать выделенное).

**Возможности**:
- ✅ Генерация React/TypeScript кода из фреймов Figma
- ✅ Извлечение дизайн-контекста (variables, components, layout)
- ✅ Поддержка Code Connect для консистентности компонентов
- ✅ Работа по прямым ссылкам на фреймы/слои

### 3. figma-framelink (Figma Developer MCP) — работает по токену

**Документация**: [Figma Developer MCP (Framelink)](https://github.com/glips/figma-context-mcp#getting-started), [Personal access tokens](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)

**Требования**:
- **Personal Access Token** из Figma (это тот токен, который у вас есть)
- Node.js и npx установлены

**Конфиг в `mcp.json`** — подставьте свой токен вместо `YOUR_FIGMA_API_KEY_HERE`:
```json
"figma-framelink": {
  "command": "cmd",
  "args": [
    "/c",
    "npx",
    "-y",
    "figma-developer-mcp",
    "--figma-api-key=ВАШ_ТОКЕН_СЮДА",
    "--stdio"
  ]
}
```
Либо через переменную окружения: добавьте `"env": { "FIGMA_API_KEY": "ваш_токен" }` и в args уберите `--figma-api-key=...`.

**Как получить Personal Access Token**:
1. Откройте [Figma Settings](https://www.figma.com/settings)
2. Раздел **"Personal access tokens"**
3. **"Create new token"** → имя (например, "Cursor MCP") → скопируйте токен
4. Вставьте в конфиг выше (или в env `FIGMA_API_KEY`)

⚠️ **Важно**: Токен показывается один раз — сохраните его. Без токена Framelink MCP не сможет обращаться к Figma API.

**Возможности**:
- ✅ Прямой доступ к Figma API
- ✅ Получение скриншотов дизайнов
- ✅ Генерация HTML/CSS из дизайнов
- ✅ Доступ к метаданным файлов

### 4. Ref MCP

**Требования**:
- API ключ из [ref.tools](https://ref.tools)

**Возможности**:
- ✅ Поиск документации по библиотекам и фреймворкам
- ✅ Чтение документации с официальных сайтов
- ✅ Поддержка множества языков и фреймворков

### 5. Sentry MCP

**Требования**:
- Аккаунт Sentry (бесплатный или платный)

**Возможности**:
- ✅ Мониторинг ошибок в реальном времени
- ✅ Анализ производительности
- ✅ Интеграция с GitHub

### 6. GitHub MCP

**Требования**:
- Personal Access Token из GitHub

**Как получить GitHub Token**:
1. Откройте [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Нажмите **"Generate new token (classic)"**
3. Выберите необходимые scopes (repo, workflow, etc.)
4. Скопируйте токен и вставьте в `mcp.json`

**Возможности**:
- ✅ Работа с репозиториями
- ✅ Создание issues и pull requests
- ✅ Управление GitHub Actions

## 🔄 Обновление конфигурации

После изменения `mcp.json`:

1. **Сохраните** файл конфигурации
2. **Полностью закройте** Cursor IDE (File → Exit или Alt+F4)
3. **Откройте** Cursor заново
4. Дождитесь подключения к MCP серверам (статус в правом нижнем углу)

## 🔍 Проверка статуса

После перезапуска Cursor:

1. Откройте панель MCP (если доступна)
2. Или используйте команду: `Ctrl/Cmd + Shift + P` → `MCP: Show Status`
3. Проверьте статус серверов:
   - ✅ **Connected** или **Ready** - сервер работает
   - ❌ **Error** - проверьте конфигурацию и логи

## ❌ Troubleshooting

### Проблема: Сервер не подключается

**Решения**:
1. Проверьте правильность токенов/ключей
2. Убедитесь, что Node.js и npx установлены (для локальных серверов)
3. Проверьте логи Cursor (View → Output → выберите канал MCP)
4. Перезапустите Cursor полностью
5. Проверьте интернет-соединение (для удаленных серверов)

### Проблема: WordPress MCP не работает

**Решения**:
1. Убедитесь, что WordPress запущен: `docker-compose ps`
2. Проверьте, что плагин WordPress MCP активирован
3. Создайте новый JWT токен (старый мог истечь)
4. Проверьте URL: `http://localhost:8002` (не `https://`)
5. Проверьте логи: `D:\template\wordpress-mcp.log`

### Проблема: Официальный Figma MCP не работает (пустой ответ / только debug UUID)

**Причина:** Официальный MCP не использует токен в `headers` — ему нужна **OAuth-авторизация** в браузере.

**Решения**:
1. В Cursor: настройки MCP → сервер **figma** → нажмите **Connect** (или Install → Connect).
2. В открывшейся вкладке Figma нажмите **Allow access**.
3. Перезапустите Cursor и повторите запрос.
4. Убедитесь, что ссылка на Figma содержит `node-id` и файл доступен вашему аккаунту.

**Токен в headers не нужен** — по [документации](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/) используется только OAuth.

### Проблема: figma-framelink не работает

**Решения**:
1. Проверьте Personal Access Token (создайте новый если истёк)
2. Убедитесь, что Node.js установлен: `node --version`
3. Убедитесь, что npx доступен: `npx --version`
4. Установите пакет глобально: `npm install -g figma-developer-mcp`

### Проблема: npx command not found (Windows)

**Решение**:
1. Установите Node.js с [официального сайта](https://nodejs.org/)
2. Перезапустите Cursor после установки
3. Проверьте в терминале: `npx --version`

## 📝 Дополнительные ресурсы

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [WordPress MCP Documentation](https://github.com/Automattic/mcp-wordpress-remote)
- [Figma MCP Documentation](https://developers.figma.com/docs/figma-mcp-server)
- [Ref MCP Documentation](https://ref.tools)
- [Sentry MCP Documentation](https://docs.sentry.io/product/integrations/mcp/)

## 🎓 Следующие шаги

После успешной настройки всех MCP серверов:

1. ✅ Протестируйте каждый сервер отдельно
2. ✅ Изучите возможности каждого сервера
3. ✅ Настройте автоматическое обновление токенов (если возможно)
4. ✅ Создайте резервные копии конфигурации

---

**Статус**: ✅ Все серверы настроены и работают  
**Последнее обновление**: 23.12.2025

