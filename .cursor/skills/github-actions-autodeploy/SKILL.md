---
name: github-actions-autodeploy
description: GitHub Actions CI/CD auto-deploy for Next.js via SSH to VPS. Use when setting up auto-deployment, configuring GitHub Actions workflows, managing GitHub Secrets programmatically, or debugging deploy pipeline failures.
---

# GitHub Actions Auto-Deploy (Next.js to VPS)

## When to Use

- Setting up automatic deployment on push to `main`
- Configuring GitHub Actions workflow for Docker Compose projects
- Managing GitHub Secrets (VPS credentials) programmatically
- Generating deploy SSH keys on VPS
- Debugging failed deploy workflows
- Re-running workflows via API

## Architecture

```
Developer pushes to main
        |
GitHub Actions triggers
        |
appleboy/ssh-action connects to VPS
        |
VPS: git pull -> docker build -> restart container
        |
Health check: curl localhost:3000
```

## Workflow File

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy Next.js to VPS

on:
  push:
    branches: [main]

concurrency:
  group: deploy
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 25
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          command_timeout: 25m
          script: |
            set -e
            cd /opt/wp-nextjs || { echo "FATAL: /opt/wp-nextjs not found"; exit 1; }

            echo "=== Preparing working tree ==="
            [ -f override.yml ] && cp override.yml /tmp/override.yml.bak
            git reset --hard HEAD
            git clean -fd
            [ -f /tmp/override.yml.bak ] && mv /tmp/override.yml.bak override.yml

            echo "=== Pulling latest code ==="
            git pull origin main

            [ -f docker-compose.production.yml ] || { echo "FATAL: docker-compose.production.yml missing after pull"; exit 1; }

            echo "=== Checking disk space ==="
            AVAIL=$(df / --output=avail -BG | tail -1 | tr -dc '0-9')
            echo "Available: ${AVAIL}GB"
            if [ "$AVAIL" -lt 3 ]; then
              echo "Low disk (${AVAIL}GB)! Aggressive cleanup..."
              journalctl --vacuum-size=50M 2>/dev/null || true
              docker system prune -af 2>/dev/null || true
              docker builder prune -af 2>/dev/null || true
              AVAIL=$(df / --output=avail -BG | tail -1 | tr -dc '0-9')
              echo "After cleanup: ${AVAIL}GB"
              if [ "$AVAIL" -lt 1 ]; then
                echo "FATAL: Not enough disk space for build (${AVAIL}GB free)"
                exit 1
              fi
            else
              docker builder prune -af --filter "until=24h"
            fi

            COMPOSE_FILES="-f docker-compose.production.yml"
            [ -f override.yml ] && COMPOSE_FILES="$COMPOSE_FILES -f override.yml"
            echo "=== Using: $COMPOSE_FILES ==="

            echo "=== Building Next.js ==="
            docker compose $COMPOSE_FILES build nextjs

            echo "=== Stopping old containers ==="
            docker compose $COMPOSE_FILES stop nextjs db-new 2>/dev/null || true
            docker compose $COMPOSE_FILES rm -f nextjs db-new 2>/dev/null || true

            echo "=== Starting Next.js ==="
            if ! docker compose $COMPOSE_FILES up -d nextjs; then
              echo "WARNING: Start failed, doing full restart..."
              docker compose $COMPOSE_FILES down --remove-orphans 2>/dev/null || true
              docker compose $COMPOSE_FILES up -d
            fi

            echo "=== Waiting for startup ==="
            sleep 15

            echo "=== Health check ==="
            curl -sf http://localhost:3000 > /dev/null || exit 1
            echo "OK: Deploy successful"
```

### Key Settings

| Setting | Value | Why |
|---|---|---|
| `set -e` | Fail on first error | Prevents silent failures (e.g. `git pull` fails but build continues with old code) |
| `git reset --hard HEAD` + `git clean -fd` | Reset tracked files and remove untracked (non-ignored) | Handles both local edits and untracked-to-tracked conflicts in one step. More reliable than `git stash` which doesn't handle untracked files |
| Preserve override.yml | Backup to `/tmp/override.yml.bak` before reset, restore after | override.yml is in `.gitignore` and lives only on VPS. `git clean -fd` would remove it if not backed up, but since it's gitignored, `git clean` skips it. Backup is a safety measure |
| override.yml optional | `[ -f override.yml ] && COMPOSE_FILES="$COMPOSE_FILES -f override.yml"` | override.yml may not exist on VPS. Use it only if present; else deploy with docker-compose.production.yml only |
| `concurrency.group: deploy` | One deploy at a time | Prevents parallel builds fighting for resources |
| `cancel-in-progress: true` | Cancel older deploy if new push arrives | Only latest code matters |
| `timeout-minutes: 25` | Job-level timeout | First build (no cache) can take 10-15 min; cached builds 1-3 min |
| `command_timeout: 25m` | SSH command timeout | Must be less than job timeout. Increased from 20m after timeout during Docker image export on large builds |
| `build` (no --no-cache) | Cached Docker build | Docker layer caching makes builds 1-3 min instead of 10+ min. Only source code changes invalidate the build layer. Use `--no-cache` only for debugging corrupted cache |
| Container cleanup before start | `stop` + `rm -f` nextjs and db-new | Prevents stuck containerd tasks ("AlreadyExists" error) from blocking container start |
| Fallback full restart | `down --remove-orphans` + `up -d` if targeted start fails | Nuclear option when targeted container cleanup doesn't resolve the issue |
| Disk space check (`df` + conditional cleanup) | Check before build, aggressive cleanup if <3GB | Prevents ENOSPC and cascading failures on small VPS disks |
| `curl ... \|\| exit 1` | Hard health check | Workflow fails if site doesn't respond (no silent "WARN") |

## GitHub Secrets

Three secrets required in GitHub repo settings:

| Secret | Value | Example |
|---|---|---|
| `VPS_HOST` | VPS IP address | `85.234.107.148` |
| `VPS_USER` | SSH username | `root` |
| `VPS_SSH_KEY` | SSH private key (full content) | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |

### Manual Setup (GitHub UI)

1. Go to repo -> Settings -> Secrets and variables -> Actions
2. Click "New repository secret"
3. Add each secret with name and value

### Programmatic Setup (API + libsodium)

GitHub requires secrets to be encrypted with the repo's public key using libsodium sealed box encryption.

**Step 1: Get repo public key**

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}
$pubKeyData = Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/actions/secrets/public-key" -Method Get -Headers $headers
# $pubKeyData.key = base64-encoded public key
# $pubKeyData.key_id = key identifier
```

**Step 2: Encrypt with Node.js + libsodium-wrappers**

```bash
mkdir /tmp/gh-secrets && cd /tmp/gh-secrets
npm init -y && npm install libsodium-wrappers
```

```javascript
// encrypt.js
const sodium = require('libsodium-wrappers');
async function run() {
    await sodium.ready;
    const secretValue = 'YOUR_SECRET_VALUE';
    const publicKey = sodium.from_base64('REPO_PUBLIC_KEY', sodium.base64_variants.ORIGINAL);
    const messageBytes = sodium.from_string(secretValue);
    const encrypted = sodium.crypto_box_seal(messageBytes, publicKey);
    process.stdout.write(sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL));
}
run();
```

**Step 3: Upload encrypted secret**

```powershell
$body = @{
    encrypted_value = $encryptedBase64
    key_id = $pubKeyData.key_id
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/actions/secrets/SECRET_NAME" `
    -Method Put -Headers $headers -Body $body -ContentType "application/json"
```

## Deploy SSH Key Setup

Generate a dedicated key on VPS for GitHub Actions (don't reuse personal keys):

```bash
# On VPS
ssh-keygen -t ed25519 -f /root/.ssh/github_actions_deploy -N '' -q

# Add public key to authorized_keys
echo "" >> /root/.ssh/authorized_keys
cat /root/.ssh/github_actions_deploy.pub >> /root/.ssh/authorized_keys

# Verify
ssh -i /root/.ssh/github_actions_deploy -o BatchMode=yes root@localhost 'echo SSH_OK'

# Display private key (upload as VPS_SSH_KEY secret)
cat /root/.ssh/github_actions_deploy
```

The **private key** goes into `VPS_SSH_KEY` GitHub Secret. The **public key** stays in `authorized_keys` on VPS.

## Monitoring and Debugging

### Check workflow runs via API

```powershell
$token = $env:GITHUB_PERSONAL_ACCESS_TOKEN
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$runs = Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/actions/runs?per_page=3" -Method Get -Headers $headers
foreach ($run in $runs.workflow_runs) {
    Write-Host "Run #$($run.run_number): $($run.status) / $($run.conclusion) - $($run.head_commit.message)"
}
```

### Get job logs

```powershell
$runId = $runs.workflow_runs[0].id
$jobs = Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/actions/runs/$runId/jobs" -Method Get -Headers $headers
$jobId = $jobs.jobs[0].id
$logs = Invoke-WebRequest -Uri "https://api.github.com/repos/OWNER/REPO/actions/jobs/$jobId/logs" -Method Get -Headers $headers
$logs.Content.Substring([Math]::Max(0, $logs.Content.Length - 1500))
```

### Re-run failed workflow

```powershell
Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/actions/runs/$runId/rerun" -Method Post -Headers $headers
```

## Common Errors

### Error: "Your local changes would be overwritten by merge" / "untracked working tree files would be overwritten"

**Cause:** Files on VPS were modified locally or exist as untracked but are tracked in repo. `git pull` refuses to overwrite them.

**Fix:** The workflow uses `git reset --hard HEAD` + `git clean -fd` before `git pull`. This handles both tracked local changes AND untracked-to-tracked conflicts in one step. For manual fix via SSH:

```bash
cd /opt/wp-nextjs
[ -f override.yml ] && cp override.yml /tmp/override.yml.bak
git reset --hard HEAD
git clean -fd
[ -f /tmp/override.yml.bak ] && mv /tmp/override.yml.bak override.yml
git pull origin main
```

**Why not `git stash`:** `git stash` only handles tracked file changes. It does NOT stash untracked files, so `git pull` still fails when untracked files conflict with tracked files in repo. `git reset --hard` + `git clean -fd` is strictly more reliable.

### Error: "docker-compose.production.yml: no such file or directory"

**Cause:** `docker-compose.production.yml` was deleted or missing after a failed deploy. This file is tracked in the repo.

**Fix (manual):** Run `git pull origin main` — the file is in repo and will be restored. If override.yml was lost, recreate it from the `override.yml` example in `coolify-vps-deployment` skill.

### Error: "AlreadyExists: task ... already exists"

**Cause:** A container was killed abruptly (by SSH timeout, OOM killer, or manual kill) and the underlying containerd task was not cleaned up. Subsequent `docker compose up -d` fails because containerd thinks the old task is still running.

**Symptom:** Docker Compose shows "Container Recreated" or "Created" but then fails with `Error response from daemon: failed to create task for container: AlreadyExists: task <hash>: already exists`. The same task hash persists across deploy runs.

**Important:** `--force-recreate` does NOT fix this. It recreates the Docker container definition but does not clear the stuck containerd task.

**Fix:** The workflow handles this with explicit `stop` + `rm -f` for nextjs and db-new containers before `up -d`. If that still fails, the fallback does `docker compose down --remove-orphans` + `up -d` (full restart of all services). For manual fix:

```bash
cd /opt/wp-nextjs
COMPOSE_FILES="-f docker-compose.production.yml"
[ -f override.yml ] && COMPOSE_FILES="$COMPOSE_FILES -f override.yml"
docker compose $COMPOSE_FILES stop nextjs db-new 2>/dev/null || true
docker compose $COMPOSE_FILES rm -f nextjs db-new 2>/dev/null || true
docker compose $COMPOSE_FILES up -d nextjs
```

If targeted cleanup doesn't work, full restart:

```bash
docker compose $COMPOSE_FILES down --remove-orphans
docker compose $COMPOSE_FILES up -d
```

### Error: "Error establishing a database connection" during build

**Cause:** WordPress/MariaDB container is down or overloaded during `next build` inside Docker. The `generateStaticParams` functions try to fetch data from WPGraphQL and get HTTP 500 with `<h1>Error establishing a database connection</h1>`.

**Symptom:** Build logs show multiple `ApolloError: Response not successful: Received status code 500` errors with `message: '<h1>Error establishing a database connection</h1>'`. May also show `connect ECONNREFUSED ::1:8002`.

**Impact:** Non-fatal. `next build` completes despite these errors. Pages that couldn't be statically generated will be rendered at runtime (ISR). The site will work but initial page loads for those routes will be slower.

**Fix:** No immediate fix needed for the deploy. If it happens frequently, check MariaDB container health (`docker logs wp-new-db`) and ensure it has enough memory and disk.

### Error: "Run Command Timeout" (SSH command exceeded timeout)

**Cause:** Docker build took longer than `command_timeout`. Common when using `--no-cache` which forces full rebuild including `npm ci` (~76s) and `COPY node_modules` (~9 min on small VPS).

**Fix:** The workflow now uses cached builds (no `--no-cache` flag) which take 1-3 min for source code changes. `command_timeout` is set to 25m as safety margin (increased from 20m after timeout during Docker image export stage). If a full rebuild is needed (e.g. after dependency changes), `npm ci` layer is rebuilt automatically when `package.json` changes — no need for `--no-cache`.

### Error: "ssh: no key found"

**Cause:** SSH private key has encoding issues (UTF-8 BOM, wrong line endings).

**Fix:** Generate a new key directly on VPS and upload the raw content as secret. Avoid passing keys through PowerShell string manipulation.

### Error: "dial tcp: lookup ***: no such host"

**Cause:** `VPS_HOST` secret has invisible characters or encoding artifacts.

**Fix:** Re-upload the secret using libsodium encryption with the value as a literal string in the Node.js script (not read from a file through PowerShell).

### Error: "unable to authenticate, attempted methods [publickey]"

**Cause:** Public key not in `authorized_keys`, or appended without a newline.

**Fix:** Check that the deploy key's public part is on its own line in `authorized_keys`:

```bash
# Check last entries
tail -5 /root/.ssh/authorized_keys

# If keys are concatenated on one line, fix with sed
sed -i 's/PREV_KEY_COMMENTssh-/PREV_KEY_COMMENT\nssh-/' /root/.ssh/authorized_keys

# Test locally
ssh -i /root/.ssh/github_actions_deploy -o BatchMode=yes root@localhost 'echo OK'
```

### Error: First workflow run fails

**Cause:** Workflow triggers on `push` to `main`, but secrets are added after the push.

**Fix:** Re-run the failed workflow via API or GitHub UI after secrets are configured.

### Error: ENOSPC during Docker build

**Cause:** VPS disk full from accumulated Docker layers.

**Fix:** The workflow checks disk space before build. If less than 3GB free, it runs aggressive cleanup (journal vacuum + docker system prune + builder prune). If still less than 1GB after cleanup, the deploy aborts. For manual cleanup: `docker system prune -af` on VPS.

### Error: Disk 100% full — cascading service failure

**Cause:** Disk completely full. MariaDB crashes (`No space left on device`), WordPress can't serve GraphQL, Next.js hangs on render.

**Symptoms:**
- Deploy workflow "succeeds" but site doesn't load
- `curl localhost:3000` hangs (0 bytes received, then timeout)
- `docker logs wp-new-db` shows `Disk got full writing 'information_schema.(temporary)'`

**Fix (manual SSH to VPS):**

```bash
cd /opt/wp-nextjs

# 1. Free space (docker commands may hang — clean logs first)
journalctl --vacuum-size=50M 2>/dev/null || true
rm -f /var/log/*.gz /tmp/*.sql /tmp/*.log
docker system prune -af
docker builder prune -af
df -h /  # Verify space freed

# 2. Restart DB and WordPress
docker restart wp-new-db && sleep 10
docker restart wp-new-wordpress && sleep 8

# 3. Rebuild Next.js (image from disk-full build may be corrupted)
docker compose -f docker-compose.production.yml -f override.yml build --no-cache nextjs
docker compose -f docker-compose.production.yml -f override.yml up -d nextjs
sleep 15
curl -sf http://localhost:3000 > /dev/null && echo "OK" || echo "FAIL"
```

**Important:** An image built when disk was full may be corrupted — Next.js accepts connections but never responds. Always rebuild with `--no-cache` after freeing disk space.

### Error: OOM — deploy succeeds but site down within minutes (Restarting 137)

**Cause:** VPS RAM insufficient (~2 GB with Coolify + WordPress + MariaDB + Next.js + Redis). OOM killer sends SIGKILL (exit 137) to processes. Containers show `Restarting (137)` and never stay up.

**Symptoms:**
- Deploy workflow passes (health check at 15s succeeds)
- Site unreachable shortly after (connection timeout to http://VPS_IP:3000)
- `docker ps` shows `wp-new-nextjs`, `wp-new-db`, `coolify-redis` as `Restarting (137)`
- `free -h` shows low `available` (<700 MB)

**Fix:** See `coolify-vps-deployment` skill → "OOM — Containers Restarting (exit 137)" for full recovery (prune, stop failing containers, restart db then nextjs). Long-term: add memory limits to override.yml or upgrade VPS RAM.

## Docker Volumes Are NOT Deployed

GitHub Actions deploys code (git-tracked files) only. Docker volumes (`wp-new-content` with wp-content/uploads) are NOT synced. Media uploaded to WordPress locally won't appear on VPS after deploy.

**To sync uploads:** See `coolify-vps-deployment` skill → "Syncing wp-content/uploads to VPS" section.

**To sync database:** See `wordpress-database-migration` skill → "Safe Export -> Transfer -> Import" section.

## Manual Deploy via SSH from Windows

When OpenSSH is not installed on Windows, use Git's bundled SSH:

```powershell
$ssh = "C:\Program Files\Git\usr\bin\ssh.exe"

# Check VPS state
& $ssh -o StrictHostKeyChecking=no root@85.234.107.148 "cd /opt/wp-nextjs && git log --oneline -3 && docker compose -f docker-compose.production.yml -f override.yml ps nextjs"

# Manual deploy (reset + pull + rebuild)
& $ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 root@85.234.107.148 "cd /opt/wp-nextjs && [ -f override.yml ] && cp override.yml /tmp/override.yml.bak || true && git reset --hard HEAD && git clean -fd && [ -f /tmp/override.yml.bak ] && mv /tmp/override.yml.bak override.yml || true && git pull origin main && docker compose -f docker-compose.production.yml -f override.yml build nextjs && docker compose -f docker-compose.production.yml -f override.yml stop nextjs db-new 2>/dev/null; docker compose -f docker-compose.production.yml -f override.yml rm -f nextjs db-new 2>/dev/null; docker compose -f docker-compose.production.yml -f override.yml up -d nextjs"
```

Use `-o ServerAliveInterval=60` for long-running commands to prevent SSH timeout. Cached builds take 1-3 min; first build or after dependency changes takes 7-10 min.

## Project-Specific: UniDent

| Parameter | Value |
|---|---|
| Workflow file | `.github/workflows/deploy.yml` |
| VPS IP | `85.234.107.148` |
| VPS user | `root` |
| Deploy SSH key | `/root/.ssh/github_actions_deploy` |
| Project dir | `/opt/wp-nextjs` |
| Docker Compose files | `docker-compose.production.yml` (tracked) + `override.yml` (optional, gitignored, VPS-only) |
| Build target | `wordpress-new` + `nextjs` services |
| Build time | ~1-3 min (cached) / ~7-10 min (first build or dependency changes) |
| GitHub repo | `lutyi2856/headless-wp-nextjs` |
| PM collaborator | `koystrubvs` (Maintain role) |
