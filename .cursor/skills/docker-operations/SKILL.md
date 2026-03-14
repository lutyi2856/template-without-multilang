---
name: docker-operations
description: Docker and Docker Compose operations - building images, container management, optimization, debugging. Use when working with Dockerfile, docker-compose.yml, container issues, or deployment.
---

# Docker Operations

## Dockerfile Optimization

### Multi-Stage Builds

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### Layer Caching

```dockerfile
# ✅ Correct order (least to most frequently changing)
FROM node:18-alpine
WORKDIR /app

# 1. Copy dependency files first
COPY package*.json ./
RUN npm ci

# 2. Copy source code after
COPY . .
RUN npm run build
```

### Security

- Use non-root user: `USER node`
- Use specific tags: `node:18-alpine` (not `latest`)
- Remove package cache: `RUN npm ci && rm -rf ~/.npm`
- Don't install unnecessary packages

## Docker Compose Patterns

### WordPress + Database

```yaml
services:
  wordpress:
    image: wordpress:latest
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./wp-content:/var/www/html/wp-content
      - ./php.ini:/usr/local/etc/php/conf.d/custom.ini
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_NAME: ${DB_NAME}
      WORDPRESS_DB_USER: ${DB_USER}
      WORDPRESS_DB_PASSWORD: ${DB_PASSWORD}
    restart: unless-stopped

  db:
    image: mariadb:latest
    volumes:
      - db_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db_data:
```

### Key Practices

- Use `depends_on` with health checks
- Named volumes for persistent data
- Environment variables (never hardcode credentials)
- Health checks for critical services
- Restart policies: `unless-stopped`, `on-failure`

## .dockerignore

```
node_modules
.next
.git
.env
*.log
.DS_Store
coverage
```

## Performance

### BuildKit (Faster Builds)

```bash
DOCKER_BUILDKIT=1 docker build -t myapp .
```

### Cache Mounts

```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

## WordPress Specific

### PHP Configuration

```ini
# php.ini
upload_max_filesize = 64M
post_max_size = 64M
memory_limit = 256M
max_execution_time = 300
```

Mount in docker-compose.yml:
```yaml
volumes:
  - ./php.ini:/usr/local/etc/php/conf.d/custom.ini
```

### File Permissions

```dockerfile
RUN chown -R www-data:www-data /var/www/html/wp-content
```

## Database Configuration

### Character Set (MariaDB/MySQL)

```yaml
db:
  image: mariadb:latest
  command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
  environment:
    MYSQL_CHARSET: utf8mb4
    MYSQL_COLLATION: utf8mb4_unicode_ci
```

### Health Checks

```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

## Development vs Production

### Development (docker-compose.override.yml)

```yaml
services:
  app:
    volumes:
      - ./src:/app/src  # Bind mount for hot reload
    environment:
      NODE_ENV: development
      DEBUG: true
```

### Production

- No bind mounts (use COPY in Dockerfile)
- Disable debug mode
- Optimize builds (multi-stage)
- Use production tags

## Common Commands

```bash
# Build
docker compose build

# Start
docker compose up -d

# Stop
docker compose down

# Restart service
docker compose restart wordpress

# View logs
docker compose logs -f wordpress

# Execute command in container
docker compose exec wordpress bash

# Remove volumes (CAREFUL!)
docker compose down -v
```

## Debugging

### Check Container Status

```bash
docker compose ps
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f wordpress

# Last 50 lines
docker compose logs --tail=50 wordpress
```

### Exec into Container

```bash
docker compose exec wordpress bash
```

### Check Health

```bash
docker compose ps
# Look for (healthy) status
```

## Disk Space Management

Docker builds and images accumulate quickly, especially with `--no-cache` rebuilds.

```bash
# Check disk usage
df -h /
docker system df

# Free all unused images, containers, networks, and build cache
docker system prune -af

# Free only builder cache
docker builder prune -af

# Typical savings: 5-15 GB on an active server
```

Run `docker system prune -af && docker builder prune -af` before rebuilding if builds fail with `ENOSPC: no space left on device`.

### When Docker Prune Hangs (Disk 100% Full)

At 100% disk usage, Docker commands (prune, build, system df) may hang indefinitely because Docker daemon needs disk space to operate. Free space outside Docker first:

```bash
# Step 1: Shrink systemd journal logs
journalctl --vacuum-size=50M 2>/dev/null || true

# Step 2: Delete compressed logs and temp files
rm -f /var/log/*.gz /tmp/*.sql /tmp/*.log /tmp/*.tar.gz

# Step 3: Now docker prune should work
docker system prune -af
docker builder prune -af

# Step 4: Verify
df -h /
```

Do NOT run multiple prune commands in parallel — only one prune operation can run at a time (`a prune operation is already running`).

### Automatic Cleanup (Cron)

Prevent disk-full by scheduling periodic cleanup:

```bash
# /etc/cron.d/docker-cleanup
0 4 * * * root docker system prune -af --filter "until=48h" 2>/dev/null; docker builder prune -af --filter "until=48h" 2>/dev/null
```

### Disk Monitoring

```bash
# One-liner: warn if disk >85%
USED=$(df / --output=pcent | tail -1 | tr -dc '0-9'); [ "$USED" -gt 85 ] && echo "WARNING: Disk ${USED}% full"

# Add to cron for periodic alerts
*/30 * * * * root USED=$(df / --output=pcent | tail -1 | tr -dc '0-9'); [ "$USED" -gt 85 ] && echo "DISK ${USED}%" | logger -t disk-monitor
```

## Container Restart Patterns

Three levels of container restart, from least to most disruptive:

### Simple restart (config unchanged, no stuck tasks)

```bash
docker compose restart SERVICE
```

Use when: container is running but misbehaving (memory leak, hung process). Does not recreate the container.

### Safe restart (clears stuck containerd tasks)

```bash
docker compose $COMPOSE_FILES stop SERVICE_1 SERVICE_2 2>/dev/null || true
docker compose $COMPOSE_FILES rm -f SERVICE_1 SERVICE_2 2>/dev/null || true
docker compose $COMPOSE_FILES up -d SERVICE_1
```

Use when: `up -d` fails with "AlreadyExists: task ... already exists", or after a container was killed abruptly. Include dependency services (e.g. db) that may also have stuck tasks.

### Nuclear restart (all services, full cleanup)

```bash
docker compose $COMPOSE_FILES down --remove-orphans 2>/dev/null || true
docker compose $COMPOSE_FILES up -d
```

Use when: safe restart doesn't work, multiple containers have issues, or unknown state. Stops and removes all containers and networks, then recreates everything. Data in named volumes is preserved.

## Layer Caching Strategy

### When to use cached builds (default)

```bash
docker compose build SERVICE
```

Docker reuses unchanged layers. If only source code changed, `npm ci` and `COPY node_modules` layers are cached. Typical time: 1-3 min.

### When to use --no-cache

```bash
docker compose build --no-cache SERVICE
```

Forces rebuild of ALL layers. Takes 7-10+ min. Use only for:
- After disk-full recovery (cached image may be corrupted)
- Debugging build issues where cache is suspected
- When base image needs updating (rare)

Do NOT use `--no-cache` in CI/CD pipelines. Docker automatically invalidates the correct layers when files change (e.g. `package.json` changes -> `npm ci` reruns).

## Troubleshooting

### Stuck Containerd Tasks ("AlreadyExists" error)

**Symptom:** `docker compose up -d` fails with:

```
Error response from daemon: failed to create task for container: AlreadyExists: task <hash>: already exists
```

**Cause:** Container was killed abruptly (timeout, OOM, manual kill) and the containerd task was not properly cleaned up. The same task hash persists across restarts.

**Important:** `--force-recreate` does NOT fix this. It recreates the Docker container definition but not the stuck containerd task.

**Fix:** Use the "safe restart" pattern:

```bash
docker compose stop SERVICE 2>/dev/null || true
docker compose rm -f SERVICE 2>/dev/null || true
docker compose up -d SERVICE
```

If that doesn't work, use the "nuclear restart" pattern (`down --remove-orphans` + `up -d`).

If even that fails (extremely rare), restart the Docker daemon:

```bash
systemctl restart docker
docker compose up -d
```

### Container Not Starting

1. Check logs: `docker compose logs service_name`
2. Check dependencies: health checks passing?
3. Check ports: conflicts with other services?

### Database Connection Issues

1. Check health check: `docker compose ps`
2. Verify credentials in `.env`
3. Check network: `docker compose exec app ping db`
4. Check database logs: `docker compose logs db`

### Permission Issues (WordPress)

```bash
docker compose exec wordpress chown -R www-data:www-data /var/www/html/wp-content
```

### Port Already in Use

```bash
# Find process
netstat -ano | findstr :3306

# Kill process (Windows)
taskkill /PID <PID> /F
```

### MariaDB Binary Name

MariaDB Docker images use `mariadb` and `mariadb-dump`, not `mysql` / `mysqldump`:

```bash
# ❌ "executable file not found in $PATH"
docker exec wp-new-db mysql -u root -pPASSWORD db_name -e "SELECT 1;"
docker exec wp-new-db mysqldump -u root -pPASSWORD db_name > dump.sql

# ✅ Correct binary names for MariaDB
docker exec wp-new-db mariadb -u root -pPASSWORD db_name -e "SELECT 1;"
docker exec wp-new-db mariadb-dump -u root -pPASSWORD db_name > dump.sql
```

The `mysqladmin` binary still works for health checks (`mysqladmin ping`).

## Project-Specific: УниДент

### Start Services

```bash
docker compose up -d
```

### WordPress Container

- Name: `wordpress-new`
- Port: 8000
- Volume: `./wordpress/wp-content`

### Database Container

- Name: `db`
- Port: 3306 (internal)
- Character set: utf8mb4
- Health check: enabled

### Restart After Changes

```bash
docker compose restart wordpress-new
```

## File Sync with Docker Containers

### Problem: Bind Mounts Not Auto-Syncing

Sometimes files edited on host don't sync to container immediately, especially:
- mu-plugins
- PHP configuration
- Custom scripts

### Solution: Manual Copy with `docker cp`

```bash
# Copy single file to container
docker cp wp-content/mu-plugins/my-plugin.php container_name:/var/www/html/wp-content/mu-plugins/

# Copy from working directory
docker cp ./file.php container:/path/

# Copy entire directory
docker cp wp-content/mu-plugins/ container:/var/www/html/wp-content/mu-plugins/
```

### Verify File in Container

```bash
# Check file exists
docker exec container_name ls -la /var/www/html/wp-content/mu-plugins/

# View file contents
docker exec container_name cat /var/www/html/wp-content/mu-plugins/my-plugin.php

# Check last lines
docker exec container_name tail -20 /var/www/html/wp-content/mu-plugins/my-plugin.php
```

### When to Use `docker cp`

Use `docker cp` when:
- ✅ Bind mount changes not reflected
- ✅ Testing quick changes
- ✅ Copying scripts/configs from host
- ✅ Debugging file sync issues

### PowerShell Notes

```powershell
# PowerShell requires careful path handling

# ✅ Works - relative path from working directory
docker cp wp-content/mu-plugins/file.php container:/path/

# ❌ May fail - absolute Windows path
docker cp d:\template\file.php container:/path/

# ✅ Works - set working directory first
cd d:\template
docker cp wp-content/mu-plugins/file.php container:/path/
```

### Cleanup: Remove Debug Files

```bash
# Remove test files from container
docker exec container_name rm -f /var/www/html/debug-file.php

# Remove multiple files
docker exec container_name rm -f /var/www/html/test1.php /var/www/html/test2.php
```

## File Migration Between Hosts (wp-content/uploads)

When deploying to a new VPS, the database is imported but media files (images, PDFs) in `wp-content/uploads/` are not included in the SQL dump. They must be transferred separately.

### Export from Local Container

```bash
# Copy uploads directory out of the container
docker cp wp-new-wordpress:/var/www/html/wp-content/uploads ./uploads-backup

# Check size
du -sh ./uploads-backup
```

### Transfer to VPS

```bash
# Using scp (from local machine)
scp -r -i ~/.ssh/id_ed25519 ./uploads-backup root@VPS_IP:/tmp/uploads

# Or tar + scp for faster transfer of many small files
tar czf uploads.tar.gz -C ./uploads-backup .
scp -i ~/.ssh/id_ed25519 uploads.tar.gz root@VPS_IP:/tmp/uploads.tar.gz
```

### Import into Production Container

```bash
# On VPS: copy into the running container
docker cp /tmp/uploads/. wp-new-wordpress:/var/www/html/wp-content/uploads/

# Or if using tar
ssh root@VPS_IP "mkdir -p /tmp/uploads && tar xzf /tmp/uploads.tar.gz -C /tmp/uploads && docker cp /tmp/uploads/. wp-new-wordpress:/var/www/html/wp-content/uploads/"

# Fix permissions (critical for WordPress to serve files)
docker exec wp-new-wordpress chown -R www-data:www-data /var/www/html/wp-content/uploads

# Verify
docker exec wp-new-wordpress ls -la /var/www/html/wp-content/uploads/
```

### Verify URLs in Database

After import, attachment URLs in the database must match the production hostname:

```sql
-- Check current URLs
SELECT guid FROM wp_posts WHERE post_type='attachment' LIMIT 5;

-- If they point to localhost, update them
UPDATE wp_posts SET guid = REPLACE(guid, 'http://localhost:8002', 'http://VPS_IP:8002') WHERE post_type='attachment';

-- Also update _wp_attached_file meta if it contains full URLs
UPDATE wp_postmeta SET meta_value = REPLACE(meta_value, 'http://localhost:8002', 'http://VPS_IP:8002')
WHERE meta_key = '_wp_attachment_metadata' OR meta_key = '_wp_attached_file';
```

### Using Docker Volumes (Alternative)

If WordPress uses a named volume (not a bind mount), you can also transfer data via the volume:

```bash
# On VPS: find the volume mount point
docker volume inspect wp-new-content

# Copy directly into the volume's mount point
cp -r /tmp/uploads/* /var/lib/docker/volumes/wp-new-content/_data/uploads/
chown -R 33:33 /var/lib/docker/volumes/wp-new-content/_data/uploads/  # www-data UID=33
```
