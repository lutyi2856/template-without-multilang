---
name: wordpress-database-migration
description: Safe WordPress database migration between Docker environments (local to VPS). Use when migrating DB to production, fixing UTF-8 encoding issues, diagnosing double-encoded Cyrillic, or replacing URLs in SQL dumps.
---

# WordPress Database Migration (Docker to Docker)

## When to Use

- Migrating WordPress DB from local Docker to production VPS
- Fixing garbled Cyrillic text (кракозябры) after DB import
- Replacing localhost URLs with production URLs in SQL dump
- Diagnosing UTF-8 double-encoding issues

## Quick Reference

### Safe Export -> Transfer -> Import

```bash
# 1. Export from local container (CORRECT way)
docker exec wp-new-db mariadb-dump -u root -pROOT_PASS --default-character-set=utf8mb4 DB_NAME > local_db.sql

# 2. Transfer to VPS
scp -i ~/.ssh/id_ed25519 local_db.sql root@VPS_IP:/tmp/local_db.sql

# 3. URL replacement ON THE VPS (not locally)
ssh root@VPS_IP "sed -i 's|http://localhost:8002|http://VPS_IP:8002|g' /tmp/local_db.sql"
ssh root@VPS_IP "sed -i 's|http://localhost:3000|http://VPS_IP:3000|g' /tmp/local_db.sql"

# 4. Drop and recreate DB with correct charset
ssh root@VPS_IP "docker exec wp-new-db mariadb -u root -pROOT_PASS -e 'DROP DATABASE IF EXISTS DB_NAME; CREATE DATABASE DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'"

# 5. Import with explicit charset
ssh root@VPS_IP "docker exec -i wp-new-db mariadb -u root -pROOT_PASS --default-character-set=utf8mb4 DB_NAME < /tmp/local_db.sql"

# 6. Verify
ssh root@VPS_IP "docker exec wp-new-db mariadb -u root -pROOT_PASS DB_NAME -e 'SELECT post_title FROM wp_posts WHERE post_type=\"nav_menu_item\" AND post_title != \"\" LIMIT 5;'"
```

## Critical Rules

### Rule 1: NEVER Export via PowerShell Redirect

PowerShell's output redirection encodes as UTF-16LE, corrupting the SQL dump.

```powershell
# WRONG - creates UTF-16 encoded file
docker exec wp-new-db mariadb-dump ... > local_db.sql

# CORRECT - pipe within Docker to produce UTF-8
docker exec wp-new-db mariadb-dump -u root -pROOT_PASS --default-character-set=utf8mb4 DB_NAME > local_db.sql
```

If you must use PowerShell, force UTF-8:

```powershell
docker exec wp-new-db mariadb-dump -u root -pROOT_PASS --default-character-set=utf8mb4 DB_NAME | Out-File -Encoding utf8 local_db.sql
```

Best approach: export directly on the host where the container runs, or use `docker exec` to write to a file inside the container:

```bash
docker exec wp-new-db bash -c "mariadb-dump -u root -pROOT_PASS --default-character-set=utf8mb4 DB_NAME > /tmp/dump.sql"
docker cp wp-new-db:/tmp/dump.sql ./local_db.sql
```

### Rule 2: Always Use --default-character-set=utf8mb4

Both for export AND import:

```bash
# Export
mariadb-dump --default-character-set=utf8mb4 ...

# Import
mariadb --default-character-set=utf8mb4 ...
```

### Rule 3: Create DB with Explicit Charset

```sql
DROP DATABASE IF EXISTS wp_production;
CREATE DATABASE wp_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Rule 4: Do URL Replacement on the Target Host

Avoid transferring modified SQL through PowerShell. Transfer the raw dump, then replace URLs on the VPS:

```bash
# On VPS
sed -i 's|http://localhost:8002|http://PRODUCTION_URL|g' /tmp/local_db.sql
sed -i 's|http://localhost:3000|http://PRODUCTION_FRONTEND|g' /tmp/local_db.sql
```

### Rule 5: After DB Fix, Rebuild Next.js

Static pages (SSG/ISR) and `fetch-cache` are built with data from the database at build time. After fixing DB encoding or reimporting, the Next.js container must be rebuilt:

```bash
docker compose -f docker-compose.production.yml build --no-cache nextjs
docker compose -f docker-compose.production.yml up -d nextjs
```

## Diagnosing Double-Encoding

### Symptoms

- Russian text appears as box-drawing characters or mojibake (e.g., `Ð£ÑÐ»ÑÐ³Ð¸` instead of `Услуги`)
- Hardcoded text in JSX renders correctly, only WordPress data is garbled
- GraphQL responses contain garbled text

### Check with HEX

```sql
SELECT post_title, HEX(post_title) FROM wp_posts
WHERE post_type='nav_menu_item' AND post_title != '' LIMIT 3;
```

**Correct UTF-8:** Each Cyrillic character = 2 bytes (e.g., `У` = `D0A3`)

```
Услуги -> D0A3D181D0BBD183D0B3D0B8
```

**Double-encoded:** Each Cyrillic character = 4 bytes (e.g., `У` = `C390C2A3`)

```
Услуги -> C390C2A3C391C281C390C2BBC391C283C390C2B3C390C2B8
```

### Fix Double-Encoding

If the data is already double-encoded in the database, fix it with SQL:

```sql
-- Backup first!
-- Fix wp_posts
UPDATE wp_posts SET
  post_title = CONVERT(BINARY CONVERT(post_title USING latin1) USING utf8mb4),
  post_content = CONVERT(BINARY CONVERT(post_content USING latin1) USING utf8mb4),
  post_excerpt = CONVERT(BINARY CONVERT(post_excerpt USING latin1) USING utf8mb4);

-- Fix wp_options (skip serialized PHP arrays)
UPDATE wp_options SET
  option_value = CONVERT(BINARY CONVERT(option_value USING latin1) USING utf8mb4)
WHERE option_name NOT IN ('active_plugins', 'uninstall_plugins', 'cron');

-- Fix wp_postmeta
UPDATE wp_postmeta SET
  meta_value = CONVERT(BINARY CONVERT(meta_value USING latin1) USING utf8mb4);

-- Fix wp_terms
UPDATE wp_terms SET
  name = CONVERT(BINARY CONVERT(name USING latin1) USING utf8mb4);

-- Fix wp_term_taxonomy
UPDATE wp_term_taxonomy SET
  description = CONVERT(BINARY CONVERT(description USING latin1) USING utf8mb4);
```

**Important:** Skip `active_plugins`, `cron`, and other serialized PHP options — the CONVERT will break serialized array length metadata.

**Preferred approach:** Re-export from local with correct encoding and reimport. Only use CONVERT as a last resort.

## Verification Checklist

After import, verify all text types:

```bash
# Menu items
docker exec wp-new-db mariadb -u root -pROOT_PASS DB_NAME -e \
  "SELECT post_title FROM wp_posts WHERE post_type='nav_menu_item' AND post_title != '' LIMIT 5;"

# Custom Post Types (doctors, services)
docker exec wp-new-db mariadb -u root -pROOT_PASS DB_NAME -e \
  "SELECT post_title FROM wp_posts WHERE post_type='doctors' AND post_status='publish' LIMIT 5;"

# ACF option values
docker exec wp-new-db mariadb -u root -pROOT_PASS DB_NAME -e \
  "SELECT option_name, LEFT(option_value, 80) FROM wp_options WHERE option_name LIKE 'options_%' LIMIT 10;"

# Taxonomy terms
docker exec wp-new-db mariadb -u root -pROOT_PASS DB_NAME -e \
  "SELECT name FROM wp_terms LIMIT 10;"

# WordPress URLs
docker exec wp-new-db mariadb -u root -pROOT_PASS DB_NAME -e \
  "SELECT option_value FROM wp_options WHERE option_name IN ('siteurl', 'home');"
```

Then verify via GraphQL:

```bash
curl -s http://VPS_IP:8002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ menu(id: \"primary\", idType: LOCATION) { menuItems { nodes { label } } } }"}' | python3 -m json.tool
```

## Common Errors

### Error: "Table doesn't exist" after import

**Cause:** Database was not created before import.
**Fix:** Create it first with `CREATE DATABASE ... CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`.

### Error: Garbled text only in dynamic sections, header is fine

**Cause:** Header uses `fetchPolicy: 'network-only'` (fresh data). Body sections use SSG/ISR cache from before the DB fix.
**Fix:** Rebuild Next.js: `docker compose build --no-cache nextjs && docker compose up -d nextjs`.

### Error: WordPress shows install page after import

**Cause:** `siteurl` and `home` in `wp_options` don't match the current access URL.
**Fix:** Check and update:

```sql
SELECT option_value FROM wp_options WHERE option_name IN ('siteurl', 'home');
UPDATE wp_options SET option_value = 'http://VPS_IP:8002' WHERE option_name IN ('siteurl', 'home');
```
