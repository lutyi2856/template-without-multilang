---
name: coolify-vps-deployment
description: Deploy Docker Compose projects to a Coolify-managed VPS via SSH. Use when deploying WordPress + Next.js to production, resolving port conflicts (Caddy/Traefik), creating production configs, OOM/exit 137 recovery, or setting up remote Docker environments.
---

# Coolify VPS Deployment

## When to Use

- Deploying Docker Compose projects to a Coolify VPS
- Resolving port 80/443 conflicts between Caddy and Traefik
- Creating production Docker Compose configs from local dev configs
- Setting up GitHub deploy keys for private repos
- Configuring DNS domains or direct IP:port access
- Recovering from OOM (containers Restarting with exit 137)

## Architecture

Coolify VPS typically has Caddy on ports 80/443 serving `coolify.vitmax.pro`. Traefik (Coolify proxy) must use alternate ports to avoid conflicts.

```
internet -> Caddy (:80/:443)
  coolify.vitmax.pro -> Coolify dashboard :8000
  demo.vitmax.pro   -> Traefik :8090
  wp.vitmax.pro     -> Traefik :8090

Traefik (:8090/:8443)
  demo.vitmax.pro -> nextjs container :3000
  wp.vitmax.pro   -> wordpress container :80
```

### Alternative: Direct IP:port (no DNS)

If DNS A-records are not configured, expose services directly:

```
http://VPS_IP:3000  -> Next.js
http://VPS_IP:8002  -> WordPress
http://VPS_IP:8082  -> phpMyAdmin
```

## Quick Reference

### SSH Connection

```bash
ssh -i C:/Users/USERNAME/.ssh/id_ed25519 root@VPS_IP
```

### Deploy Commands

```bash
cd /opt/wp-nextjs

# With domain-based routing (Traefik)
docker compose -f docker-compose.production.yml up -d

# With direct IP:port access (override)
docker compose -f docker-compose.production.yml -f override.yml up -d

# Rebuild specific service (cached — fast if only source changed)
docker compose -f docker-compose.production.yml -f override.yml build nextjs
docker compose -f docker-compose.production.yml -f override.yml stop nextjs db-new 2>/dev/null || true
docker compose -f docker-compose.production.yml -f override.yml rm -f nextjs db-new 2>/dev/null || true
docker compose -f docker-compose.production.yml -f override.yml up -d nextjs
```

## Step-by-Step Deployment

### Step 1: Fix Port 80 Conflict

Coolify's Traefik can't start if Caddy holds port 80.

**Reconfigure Traefik ports:**

```bash
# On VPS, edit Coolify's Traefik config
vi /data/coolify/proxy/docker-compose.yml
```

Change ports from `80:80`, `443:443` to `8090:80`, `8443:443`, `8888:8080`.

**Add Caddy proxy rules:**

```bash
vi /etc/caddy/Caddyfile
```

```caddy
demo.vitmax.pro {
    reverse_proxy localhost:8090
}
wp.vitmax.pro {
    reverse_proxy localhost:8090
}
pma.vitmax.pro {
    reverse_proxy localhost:8090
}
```

Then restart both:

```bash
systemctl restart caddy
cd /data/coolify/proxy && docker compose up -d
```

### Step 2: Prepare Project Files on VPS

```bash
# Clone repo (or upload via scp)
mkdir -p /opt/wp-nextjs
cd /opt/wp-nextjs
git clone https://github.com/OWNER/REPO.git .
```

### Auto-Deploy via GitHub Actions

Push to `main` triggers automatic deployment (build + restart Next.js container). See skill `github-actions-autodeploy` for full details. A dedicated deploy SSH key exists at `/root/.ssh/github_actions_deploy` on VPS.

### Deploy Key for Private Repos

```bash
# On VPS, generate key
ssh-keygen -t ed25519 -f /root/.ssh/deploy_key -N ""
cat /root/.ssh/deploy_key.pub
# Add public key to GitHub repo -> Settings -> Deploy Keys

# Clone with deploy key
GIT_SSH_COMMAND="ssh -i /root/.ssh/deploy_key" git clone git@github.com:OWNER/REPO.git .
```

### Step 3: Create .env.production

```bash
cat > /opt/wp-nextjs/.env.production << 'EOF'
WORDPRESS_HOME_URL=https://wp.vitmax.pro
NEXTJS_SITE_URL=https://demo.vitmax.pro
DB_NAME=wp_production
DB_USER=wp_user
DB_PASSWORD=GENERATE_STRONG_PASSWORD
DB_ROOT_PASSWORD=GENERATE_STRONG_PASSWORD
FAUST_SECRET_KEY=GENERATE_RANDOM_STRING
EOF
```

### Step 4: Create docker-compose.production.yml

Key differences from local `docker-compose.yml`:

- Traefik labels for domain routing
- `coolify` external network
- Build args for `NEXT_PUBLIC_*` variables (baked into client JS)
- Production restart policies

### Step 5: Create override.yml (for direct IP access)

When DNS is not available, use an override file to map ports directly:

```yaml
services:
  wordpress-new:
    ports:
      - "8002:80"
    environment:
      WORDPRESS_HOME_URL: "http://VPS_IP:8002"
  pma-new:
    ports:
      - "8082:80"
  nextjs:
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_WP_URL: "http://VPS_IP:8002"
      NEXT_PUBLIC_GRAPHQL_ENDPOINT: "http://wordpress-new/graphql"
    # Optional: prevent OOM on low-RAM VPS (see "OOM — Containers Restarting")
    # deploy:
    #   resources:
    #     limits:
    #       memory: 512M
```

### Step 6: Build and Start

```bash
cd /opt/wp-nextjs

# Load env
export $(cat .env.production | xargs)

# Build all services
docker compose -f docker-compose.production.yml -f override.yml build

# Start
docker compose -f docker-compose.production.yml -f override.yml up -d

# Check status
docker compose -f docker-compose.production.yml -f override.yml ps
```

### Step 7: Verify

```bash
# Check all containers running
docker ps

# Check Next.js logs
docker logs --tail 20 wp-new-nextjs

# Test HTTP (direct IP access)
curl -sf -o /dev/null -w '%{http_code}' http://localhost:3000/  # 200 = OK

# Test GraphQL
curl -s http://localhost:8002/graphql -H "Content-Type: application/json" \
  -d '{"query":"{ generalSettings { title } }"}' | head -100
```

## Gotchas

### NEXT_PUBLIC_* Must Be in Build Args AND Runtime Env

`NEXT_PUBLIC_*` variables are baked into the client-side JavaScript bundle at build time. If they are only set as runtime env, the browser-side code won't see them.

```yaml
nextjs:
  build:
    args:
      NEXT_PUBLIC_GRAPHQL_ENDPOINT: http://VPS_IP:8002/graphql  # For client-side JS
      NEXT_PUBLIC_WP_URL: http://VPS_IP:8002
  environment:
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: http://VPS_IP:8002/graphql    # For server-side
    NEXT_PUBLIC_WP_URL: http://VPS_IP:8002
```

The build arg must point to the **publicly accessible** URL (not internal Docker hostname like `http://wordpress-new`), because the client browser resolves it.

### Coolify API Limitations

Coolify API (v4.0-beta) has limitations for Docker Compose applications:
- Creating apps via API may return 422 errors for complex configurations
- Private GitHub repos require manual deploy key setup
- Recommendation: use SSH-based deployment directly on VPS for Docker Compose projects

### Coolify External Network

Production Docker Compose must join the `coolify` external network for Traefik routing:

```yaml
networks:
  coolify:
    external: true
```

### WordPress Plugins Not In Image

WordPress plugins installed via admin panel live in the Docker volume, not in the image. When deploying fresh, you must either:
1. Include plugins in the Dockerfile/build context
2. Copy plugins from local container: `docker cp wp-container:/var/www/html/wp-content/plugins ./plugins`
3. Upload and extract into the production container

### SSH from PowerShell (Windows)

When OpenSSH is not installed (common on Windows), use Git's bundled SSH:

```powershell
$sshExe = "C:\Program Files\Git\usr\bin\ssh.exe"

# Quick check (no key needed if VPS has authorized_keys for your key)
& $sshExe -o StrictHostKeyChecking=no root@85.234.107.148 "docker ps"

# With explicit key
$sshKey = "C:\Users\Sergey\.ssh\id_ed25519"
& $sshExe -i $sshKey root@85.234.107.148 "docker ps"

# Long-running commands (docker build) — add keepalive
& $sshExe -o StrictHostKeyChecking=no -o ServerAliveInterval=60 root@85.234.107.148 "cd /opt/wp-nextjs && docker compose -f docker-compose.production.yml -f override.yml build --no-cache nextjs"
```

For script transfer:

```powershell
$scpExe = "C:\Program Files\Git\usr\bin\scp.exe"
& $scpExe -i $sshKey "D:\template\script.sh" root@VPS_IP:/tmp/script.sh
```

Convert line endings before execution on VPS:

```bash
sed -i 's/\r$//' /tmp/script.sh
chmod +x /tmp/script.sh
```

### Local Changes / Untracked Conflicts Block git pull

If files on VPS are modified locally or exist as untracked but are tracked in repo, `git pull` will fail:

```
error: Your local changes to the following files would be overwritten by merge
error: The following untracked working tree files would be overwritten by merge
```

The deploy workflow handles both cases with `git reset --hard HEAD` + `git clean -fd` before `git pull`. This is more reliable than `git stash` which doesn't handle untracked files.

**Automated (in deploy.yml):**

```bash
[ -f override.yml ] && cp override.yml /tmp/override.yml.bak
git reset --hard HEAD    # restore all tracked files to last commit
git clean -fd            # remove untracked (non-ignored) files and dirs
[ -f /tmp/override.yml.bak ] && mv /tmp/override.yml.bak override.yml
git pull origin main
```

**Manual intervention:**

```bash
cd /opt/wp-nextjs
[ -f override.yml ] && cp override.yml /tmp/override.yml.bak
git reset --hard HEAD
git clean -fd
[ -f /tmp/override.yml.bak ] && mv /tmp/override.yml.bak override.yml
git pull origin main
```

**Why `git reset --hard` + `git clean -fd` instead of `git stash`:**
- `git stash` only handles tracked file modifications, not untracked-to-tracked conflicts
- `git reset --hard HEAD` restores all tracked files to the last commit state
- `git clean -fd` removes untracked files that aren't in `.gitignore` (would-be conflicts)
- `override.yml` is in `.gitignore` so `git clean -fd` skips it, but backup is a safety measure

**Important:** Without `set -e` in the deploy script, `git pull` failure is silent — the workflow continues, builds old code, and reports "success". Always use `set -e`.

### Disk Space — ENOSPC During Build

Docker builds accumulate layers and cache. On small VPS disks (20-40 GB), builds fail with `ENOSPC: no space left on device`.

```bash
# Check disk usage
df -h /
docker system df

# Free space (typically 5-15 GB)
docker system prune -af && docker builder prune -af
```

Run this before `docker compose build --no-cache` if the VPS has been running for a while.

### Disk 100% Full — Cascading Service Failure

When the disk reaches 100%, all services fail in cascade:

1. **MariaDB crashes** — cannot write temporary tables (`Disk got full writing 'information_schema.(temporary)'`)
2. **WordPress hangs** — GraphQL requests timeout or return `SocketError: other side closed`
3. **Next.js hangs** — accepts TCP connections but never sends a response (0 bytes received)
4. **Docker commands hang** — `docker prune`, `docker build` stall indefinitely

**Recovery procedure (order matters!):**

```bash
# Step 1: Free space via system logs FIRST (docker commands won't work on 100% disk)
journalctl --vacuum-size=50M 2>/dev/null || true
rm -f /var/log/*.gz /tmp/*.sql /tmp/*.log

# Step 2: Now docker prune will work
docker system prune -af --volumes
docker builder prune -af

# Step 3: Verify space freed
df -h /  # Should show at least 10-15% free

# Step 4: Restart MariaDB (crashed from disk full)
docker restart wp-new-db
sleep 10
docker logs --tail 5 wp-new-db  # Should show "ready for connections"

# Step 5: Restart WordPress (workers stuck on failed requests)
docker restart wp-new-wordpress
sleep 8
curl -sf -o /dev/null -w '%{http_code}' http://localhost:8002/  # Should be 200

# Step 6: Rebuild Next.js (image may be corrupted from building on full disk)
cd /opt/wp-nextjs
docker compose -f docker-compose.production.yml -f override.yml build --no-cache nextjs
docker compose -f docker-compose.production.yml -f override.yml up -d nextjs
sleep 15
curl -sf http://localhost:3000 > /dev/null && echo "OK" || echo "FAIL"
```

**Prevention:** The deploy workflow (`deploy.yml`) checks disk space before builds. For proactive monitoring, add a cron job:

```bash
# /etc/cron.d/disk-monitor — alert when disk >85%
*/30 * * * * root USED=$(df / --output=pcent | tail -1 | tr -dc '0-9'); [ "$USED" -gt 85 ] && echo "DISK WARNING: ${USED}% used on $(hostname)" | logger -t disk-monitor
```

### OOM — Containers Restarting (exit 137)

When RAM is insufficient (~2 GB VPS with Coolify + WordPress + MariaDB + Next.js + Redis), the OOM killer sends SIGKILL (exit code 137) to processes. Containers show `Restarting (137)` and never stay up — site at `http://VPS_IP:3000` times out.

**Symptoms:**
- `docker ps` shows `wp-new-nextjs`, `wp-new-db`, `coolify-redis` as `Restarting (137)`
- `free -h` shows low `available` (e.g. <700 MB)
- Site unreachable (connection timeout)

**Recovery procedure:**

```bash
cd /opt/wp-nextjs
COMPOSE_FILES="-f docker-compose.production.yml"
[ -f override.yml ] && COMPOSE_FILES="$COMPOSE_FILES -f override.yml"

# Step 1: Stop failing containers to free memory
docker compose $COMPOSE_FILES stop nextjs db-new 2>/dev/null || true
docker compose $COMPOSE_FILES rm -f nextjs db-new 2>/dev/null || true

# Step 2: Prune Docker (build cache ~4 GB) — frees RAM
docker builder prune -af 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# Step 3: Start MariaDB first (Next.js depends on WordPress, WP on DB)
docker compose $COMPOSE_FILES up -d db-new
sleep 20
docker logs --tail 5 wp-new-db  # Should show "ready for connections"

# Step 4: Start Next.js (if compose waits for health, use direct start)
docker compose $COMPOSE_FILES up -d nextjs
# If nextjs stays "Created" (waiting for db health), start manually:
docker start wp-new-nextjs
sleep 15
curl -sf -o /dev/null -w '%{http_code}' http://localhost:3000/  # Should be 200
```

**Prevention — memory limits** (optional, in override.yml):

```yaml
services:
  nextjs:
    deploy:
      resources:
        limits:
          memory: 512M
  db-new:
    deploy:
      resources:
        limits:
          memory: 384M
```

**Long-term:** Upgrade VPS RAM (2 GB is tight for this stack) or reduce services (e.g. disable coolify-redis if not critical).

### Stuck Containerd Tasks ("AlreadyExists" error)

When a container is killed abruptly (SSH timeout, OOM, manual kill), the containerd task may not be cleaned up. Subsequent `docker compose up -d` fails:

```
Error response from daemon: failed to create task for container: AlreadyExists: task <hash>: already exists
```

The stuck task hash persists across deploy runs. `--force-recreate` does NOT fix this (it recreates the Docker container but not the containerd task).

**Fix:** Explicitly stop and remove the affected containers before starting:

```bash
docker compose $COMPOSE_FILES stop nextjs db-new 2>/dev/null || true
docker compose $COMPOSE_FILES rm -f nextjs db-new 2>/dev/null || true
docker compose $COMPOSE_FILES up -d nextjs
```

**Fallback** (if targeted cleanup doesn't work):

```bash
docker compose $COMPOSE_FILES down --remove-orphans 2>/dev/null || true
docker compose $COMPOSE_FILES up -d
```

The deploy workflow handles this automatically with container cleanup before `up -d` and a fallback to full restart.

### Docker Layer Caching (Don't Use --no-cache in CI/CD)

Docker layer caching dramatically speeds up builds. When only source code changes, Docker reuses cached layers for `npm ci`, `COPY node_modules`, etc.

| Build type | Time | When |
|---|---|---|
| `docker compose build` (cached) | 1-3 min | Source code changes only |
| `docker compose build --no-cache` | 7-10+ min | Forces full rebuild of all layers |

**Rule:** Never use `--no-cache` in CI/CD pipelines. Docker automatically invalidates the correct layers when files change (e.g. `package.json` changes -> `npm ci` reruns). Use `--no-cache` only for:
- Debugging suspected corrupted cache
- After disk-full recovery (image may be corrupted)
- Explicit full rebuild for troubleshooting

### Docker Compose v2 Syntax

Modern Docker installations use `docker compose` (v2, built into Docker CLI), not `docker-compose` (v1, separate binary).

```bash
# ❌ Often not installed on modern VPS
docker-compose -f docker-compose.production.yml up -d

# ✅ Correct — Docker Compose v2
docker compose -f docker-compose.production.yml up -d
```

### override.yml Must Be in Project Directory

`override.yml` lives at `/opt/wp-nextjs/override.yml` (same directory as `docker-compose.production.yml`). This file is in `.gitignore` and exists only on VPS (not in repo).

**Deploy workflow:** Uses override.yml only if it exists (`[ -f override.yml ] && COMPOSE_FILES="$COMPOSE_FILES -f override.yml"`). If absent, deploy runs with `docker-compose.production.yml` only (no direct IP port mapping).

```bash
# Verify it exists
cat /opt/wp-nextjs/override.yml

# Use alongside production config
docker compose -f docker-compose.production.yml -f override.yml up -d
```

Never store it in `/tmp` — files there are cleared on reboot. For temporary backup during deploy, use `/tmp/override.yml.bak` and restore immediately after `git pull`.

## Syncing wp-content/uploads to VPS

WordPress uploads (images, media) live in the Docker volume `wp-new-content`, NOT in git. GitHub Actions deploy does NOT transfer them. Manual sync is required when new images are uploaded locally.

### Full Sync Workflow (Windows → VPS)

```powershell
# Step 1: Export from local container
docker cp wp-new-wordpress:/var/www/html/wp-content/uploads/. D:/template/wp-uploads-backup/

# Step 2: Verify local count
(Get-ChildItem -Path wp-uploads-backup -Recurse -File | Measure-Object).Count

# Step 3: Clean remote destination and SCP entire folder (NOT wildcard — wildcard misses files)
$ssh = "C:\Program Files\Git\usr\bin\ssh.exe"
$scp = "C:\Program Files\Git\usr\bin\scp.exe"
& $ssh -i $env:USERPROFILE\.ssh\id_ed25519 -o StrictHostKeyChecking=no root@85.234.107.148 "rm -rf /tmp/wp-uploads-backup && mkdir -p /tmp/wp-uploads-backup"
& $scp -i $env:USERPROFILE\.ssh\id_ed25519 -o StrictHostKeyChecking=no -r "D:/template/wp-uploads-backup" root@85.234.107.148:/tmp/

# Step 4: Copy into Docker container + fix permissions
& $ssh -i $env:USERPROFILE\.ssh\id_ed25519 -o StrictHostKeyChecking=no root@85.234.107.148 "docker cp /tmp/wp-uploads-backup/. wp-new-wordpress:/var/www/html/wp-content/uploads/ && docker exec wp-new-wordpress chown -R www-data:www-data /var/www/html/wp-content/uploads/"

# Step 5: Verify count in container matches local
& $ssh -i $env:USERPROFILE\.ssh\id_ed25519 -o StrictHostKeyChecking=no root@85.234.107.148 "docker exec wp-new-wordpress find /var/www/html/wp-content/uploads -type f | wc -l"

# Step 6: Verify HTTP access
Invoke-WebRequest -Uri "http://85.234.107.148:8002/wp-content/uploads/2026/02/SOME_FILE.webp" -Method Head -UseBasicParsing

# Step 7: Force-recreate Next.js to clear ISR cache
& $ssh -i $env:USERPROFILE\.ssh\id_ed25519 -o StrictHostKeyChecking=no root@85.234.107.148 "cd /opt/wp-nextjs && docker compose -f docker-compose.production.yml -f override.yml up -d --force-recreate nextjs"

# Step 8: Cleanup
Remove-Item -Recurse -Force D:/template/wp-uploads-backup
& $ssh -i $env:USERPROFILE\.ssh\id_ed25519 -o StrictHostKeyChecking=no root@85.234.107.148 "rm -rf /tmp/wp-uploads-backup"
```

### Gotchas

- **SCP wildcard `*` on Windows misses files** — always SCP the entire directory, not `dir/*`
- **`docker cp source/. target/`** — trailing `/.` copies contents, not the directory itself
- **Force-recreate vs restart** — `--force-recreate` is needed to clear in-memory ISR cache
- **chown is mandatory** — without it, WordPress can't write to uploads

## Diagnose: Site Unreachable (http://VPS_IP:3000)

1. **SSH + docker ps** — if `wp-new-nextjs` shows `Restarting (137)` → OOM, see "OOM — Containers Restarting" above
2. **df -h /** — if 100% used → disk full, see "Disk 100% Full"
3. **docker ps** — if nextjs not in list → `docker start wp-new-nextjs` or run full recovery
4. **curl localhost:3000** from VPS — if 200, firewall may block external access

## Project-Specific: УниДент

| Parameter | Value |
|---|---|
| VPS IP | `85.234.107.148` |
| SSH key | `C:\Users\Sergey\.ssh\id_ed25519` |
| Project dir on VPS | `/opt/wp-nextjs` |
| Docker Compose | `docker-compose.production.yml` |
| Override | `/opt/wp-nextjs/override.yml` (gitignored) |
| Deploy SSH key | `/root/.ssh/github_actions_deploy` |
| Auto-deploy | GitHub Actions (see `github-actions-autodeploy` skill) |
| Env | `.env.production` |
| GitHub repo | `https://github.com/lutyi2856/headless-wp-nextjs` |
| Next.js | `http://85.234.107.148:3000` |
| WordPress | `http://85.234.107.148:8002` |
| phpMyAdmin | `http://85.234.107.148:8082` |
| Containers | `wp-new-wordpress`, `wp-new-db`, `wp-new-nextjs`, `wp-new-pma` |
