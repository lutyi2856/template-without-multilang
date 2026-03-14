# Восстановление темплейта

1. `git clone https://github.com/lutyi2856/template-without-multilang.git`
2. `cd template-without-multilang`
3. `docker compose up -d`
4. Восстановить БД: `docker exec -i wp-new-db mysql -u wp_user -pwp_password wp_new < db-backup/template-snapshot.sql`
5. `cd nextjs && npm install && npm run dev`

## Cursor

Правила, скиллы и агенты уже в `.cursor/`. Откройте проект в Cursor — всё подхватится автоматически.

Для Figma MCP замените `YOUR_FIGMA_API_KEY` в `.cursor/mcp.json` на свой API-ключ.

## Полный Docker-бэкап

Полный бэкап (db.sql, wp-content.tar.gz, wp-config.php) в Release:  
https://github.com/lutyi2856/template-without-multilang/releases/tag/v1.0.0-docker-backup
